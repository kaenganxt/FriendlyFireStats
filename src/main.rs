use actix_web::{get, web, App, HttpResponse, HttpServer, Responder, rt::System};
use serde::Serialize;
use serde::Deserialize;
use chrono::DateTime;
use chrono::Utc;
use std::thread;
use std::io;

use std::fs;
use std::fs::File;
use std::time::Duration;
use actix_files::Files;
use std::sync::RwLock;
use std::io::Write;
use chrono::Datelike;

use std::collections::HashMap;
use actix_web::middleware::Logger;
use std::time;

use simplelog::{WriteLogger, Config, LevelFilter, CombinedLogger, SimpleLogger, TermLogger, TerminalMode, ColorChoice};

#[derive(Serialize)]
enum ResponseState {
    OK,
    RELOAD,
}

#[derive(Serialize)]
struct DataResponse<'a> {
    state: ResponseState,
    donations: &'a Vec<DonationState>,
}

#[derive(Deserialize)]
struct DonationRequest {
    last_request: Option<DateTime<Utc>>,
}

#[derive(Serialize, Deserialize, Debug)]
struct DonationState {
    donations_count: u32,
    donor_count: u32,
    donated_amount_in_cents: u64,
    updated_at: String,
}

#[derive(Serialize, Deserialize)]
struct Donations {
    donations: Vec<DonationState>,
}

struct AppState {
    donations: RwLock<HashMap<i32, Donations>>,
    static_updated: RwLock<DateTime<Utc>>,
}

const DATA_DIR: &'static str = "data";

#[get("/years")]
async fn year_list(state: web::Data<AppState>) -> impl Responder {
    let years = state.donations.read().unwrap();
    let years = years.keys().collect::<Vec<&i32>>();
    HttpResponse::Ok().json(years)
}

#[get("/donations/{year}")]
async fn data(data: web::Data<AppState>, info: web::Query<DonationRequest>, path: web::Path<i32>) -> impl Responder {
    let year = path.into_inner();
    let last_static_update = data.static_updated.read().unwrap();
    let state = if info.last_request.is_some() && info.last_request.unwrap() < *last_static_update {
        ResponseState::RELOAD
    } else {
        ResponseState::OK
    };
    let donations = data.donations.read().unwrap();
    if !donations.contains_key(&year) {
        HttpResponse::BadRequest().body(format!("Year {} is not supported", year))
    } else {
        HttpResponse::Ok().json(DataResponse { state, donations: &donations.get(&year).unwrap().donations })
    }
}

fn request_thread(donations_store: web::Data<AppState>) {
    let this_year = Utc::now().year();
    loop {
        let now = time::Instant::now();
        let body = reqwest::blocking::get("https://api.betterplace.org/de/api_v4/fundraising_events/47806.json");
        match body {
            Ok(body) => {
                let res : Result<DonationState, _> = body.json();
                match res {
                    Ok(res) => {

                        // Critical section, will block all donation HTTP requests
                        {
                            let mut writer = donations_store.donations.write().unwrap();
                            let this_year_data = writer.get_mut(&this_year);
                            if this_year_data.is_none() {
                                panic!("No data structure for this year available! Maybe this program ran into the new year?");
                            }
                            let last_date = this_year_data.as_ref().unwrap().donations.last();
                            let add = if let Some(last_date) = last_date {
                                last_date.updated_at != res.updated_at
                            } else {
                                true
                            };
                            if add {
                                this_year_data.unwrap().donations.push(res);
                            }
                        }

                        let res = serde_json::to_string_pretty(&donations_store.donations.read().unwrap().get(&this_year)).unwrap();
                        fs::write(format!("{DATA_DIR}/donations_{this_year}.json"), res).unwrap();
                    }
                    Err(e) => println!("Failed to parse API response: {}", e)
                }
            }
            Err(e) => println!("Failed to request donation API: {}", e)
        }

        let one_minute = time::Duration::from_secs(60);
        thread::sleep(one_minute - now.elapsed());
    }
}

fn main() -> std::io::Result<()> {

    CombinedLogger::init(vec![
        WriteLogger::new(LevelFilter::Info, Config::default(), File::create("donations_web.log")?),
        TermLogger::new(LevelFilter::Info, Config::default(), TerminalMode::Mixed, ColorChoice::Auto),
    ]).unwrap();

    let this_year = Utc::now().year();

    let mut years = HashMap::new();
    for year in 2020..=this_year {
        let file = File::open(format!("{DATA_DIR}/donations_{year}.json"));
        if let Ok(file) = file {
            let donations_read = serde_json::from_reader(file).expect("JSON was not well-formatted (Reading input file)");
            years.insert(year, donations_read);
        }
    }

    println!("Loaded supported years: {:?}", years.keys());

    years.entry(this_year).or_insert_with(|| Donations { donations: vec![] });

    let static_updated = RwLock::new(Utc::now());
    let donations: web::Data<AppState> = web::Data::new(AppState { donations: RwLock::new(years), static_updated });

    let donations_copy = donations.clone();

    thread::spawn(move || {
        let sys = System::new();

        let server = HttpServer::new(move || {
            App::new()
                .app_data(donations_copy.clone())
                .wrap(Logger::new("%r -> %s (took %Ts)"))
                .service(web::scope("/api").service(data).service(year_list))
                .service(Files::new("/", "static").index_file("index.html"))
        })
        .bind("0.0.0.0:8080")?
        .shutdown_timeout(15)
        .run();

        sys.block_on(server)
    });

    let donations_copy = donations.clone();
    thread::spawn(move || request_thread(donations_copy));

    println!("Server started. Starting CLI.");
    let mut line;
    print!("> ");
    io::stdout().flush()?;
    loop {
        line = String::new();
        let res = io::stdin().read_line(&mut line);
        if res.is_err() {
            println!("Invalid input");
            continue;
        } else if res? == 0 {
            thread::sleep(Duration::from_millis(100));
            continue;
        } else if line == "stop\n" || line == "exit\n" || line == "quit\n" || line == "q\n" {
            println!("Stopping...");
            break;
        } else if line == "reload\n" {
            println!("Queueing reload...");
            let mut writer = donations.static_updated.write().unwrap();
            *writer = Utc::now();
        } else {
            println!("Unknown command. Known commands include reload and stop.");
        }
        print!("> ");
        io::stdout().flush()?;
    }
    Ok(())
}


use serde::{Serialize, Deserialize};
use std::{time, thread, fs};
use std::sync::mpsc;
use std::sync::mpsc::{Receiver, Sender};

#[derive(Serialize, Deserialize)]
struct DonationState {
    donations_count: u32,
    donor_count: u32,
    donated_amount_in_cents: u64,
    updated_at: String
}

#[derive(Serialize, Deserialize)]
struct Donations {
    donations: Vec<DonationState>
}

fn main() {

    let (tx, rx): (Sender<DonationState>, Receiver<DonationState>) = mpsc::channel();

    thread::spawn(move || {

        loop {
            let state = rx.recv();
            match state {
                Ok(donation) => {
                    let file = fs::File::open("donations.json").expect("file should open read only");

                    let mut donations: Donations = serde_json::from_reader(file).expect("JSON was not well-formatted");
                    donations.donations.push(donation);
                    let res = serde_json::to_string_pretty(&donations).unwrap();
                    fs::write("donations.json", res).unwrap();
                },
                Err(_) => {}
            }
        }
    });

    loop {
        let now = time::Instant::now();
        let body = reqwest::blocking::get("https://api.betterplace.org/de/api_v4/fundraising_events/36081.json").unwrap();
        let res : DonationState = body.json().unwrap();

        tx.send(res).unwrap();

        let one_minute = time::Duration::from_secs(60);
        thread::sleep(one_minute - now.elapsed());
    }
}

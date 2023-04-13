FROM rust:alpine as builder
RUN apk add gcc g++
COPY . /build
WORKDIR /build
RUN cargo build --release

FROM alpine:latest
RUN mkdir -p /app
COPY --from=builder /build/target/release/friendly_fire_stats /app
COPY static/ /app/static

VOLUME /app/data

WORKDIR /app
CMD ["./friendly_fire_stats"]

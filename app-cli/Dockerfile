# Dockerfile for a raw minimal container (Expected size 1.8MB)
####################################################################################################
## Builder
####################################################################################################
FROM golang:alpine as builder
WORKDIR /app 
COPY . .
# Build the app, strip it (LDFLAGS) and optimize it with UPX
RUN apk add upx && \
    CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ./build/app -ldflags="-w -s" . && \
    upx --best --lzma ./build/app

####################################################################################################
## Final image
####################################################################################################
FROM alpine
WORKDIR /app
# Import certificates from alpine, scratch doesn't have any cert by default 
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder "/app/build/app" "/app/"
ENTRYPOINT ["./app"]

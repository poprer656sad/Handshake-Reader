package main

import (
	"bufio"
	"fmt"
	"net"
	"net/http"
	"net/http/httputil"
	"time"
	"bytes"
	"encoding/json"

	"github.com/refraction-networking/utls"
	"golang.org/x/net/http2"
)

var (
	dialTimeout   = time.Duration(15) * time.Second
	sessionTicket = []uint8(`Here goes phony session ticket: phony enough to get into ASCII range
Ticket could be of any length, but for camouflage purposes it's better to use uniformly random contents
and common length. See https://tlsfingerprint.io/session-tickets`)
)

var requestHostname = "footlocker.com" // speaks http2 and TLS 1.3
var requestPath = "assets/2b70dfd4ui184373e9376ce042ec64" // speaks http2 and TLS 1.3
var requestAddr = "23.221.211.71:443"


func main() {
    http.HandleFunc("/sensor", sensor)
    http.ListenAndServe(":8090", nil)

	return
}

func sensor(w http.ResponseWriter, req *http.Request) {
    sd, ok := req.URL.Query()["sd"]
    abckcookie, ok := req.URL.Query()["abck"]
    bmszcookie, ok := req.URL.Query()["bmsz"]
    if !ok{
        fmt.Printf("%+v\n", ok)
    }
    var response *http.Response
   	var err error

   	response, err = HttpGetCustomExfil(requestHostname, requestAddr, sd[0], abckcookie[0], bmszcookie[0])
   	if err != nil {
   		fmt.Printf("#> HttpGetCustomExfil() failed: %+v\n", err)
   	} else {
   		fmt.Printf("#> HttpGetCustomExfil() response: %+s\n", dumpResponseNoBody(response))
   	}
   	
    fmt.Fprintf(w, dumpResponseNoBody(response))
    }

func httpGetOverConn(conn net.Conn, alpn string, sensor_data string, abckval string, bmszval string) (*http.Response, error) {
	body, _ := json.Marshal(map[string]interface{}{"sensor_data":sensor_data})
	req, _ := http.NewRequest(
		"POST",
		"https://www."+requestHostname+"/"+requestPath,
		bytes.NewBuffer(body),
	)

    req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36")
	req.AddCookie(&http.Cookie{
	    Name: "_abck",
	    Value: abckval,
	    Domain:".footlocker.com",
	})

	req.AddCookie(&http.Cookie{
    	    Name: "bm_sz",
    	    Value: bmszval,
    	    Domain:".footlocker.com",
    	})

    fmt.Printf("%+v\n", req.Header)
    fmt.Printf("%+v\n", req.Body)

	switch alpn {
	case "h2":
		req.Proto = "HTTP/2.0"
		req.ProtoMajor = 2
		req.ProtoMinor = 0

		tr := http2.Transport{}
		cConn, err := tr.NewClientConn(conn)
		if err != nil {
			return nil, err
		}
		return cConn.RoundTrip(req)
	case "http/1.1", "":
		req.Proto = "HTTP/1.1"
		req.ProtoMajor = 1
		req.ProtoMinor = 1

		err := req.Write(conn)
		if err != nil {
			return nil, err
		}

		return http.ReadResponse(bufio.NewReader(conn), req)
	default:
		return nil, fmt.Errorf("unsupported ALPN: %v", alpn)
	}
}

func dumpResponseNoBody(response *http.Response) string {
	resp, err := httputil.DumpResponse(response, true)
	if err != nil {
		return fmt.Sprintf("failed to dump response: %v", err)
	}
	return string(resp)
}

func HttpGetCustomExfil(hostname string, addr string, sensor_data string, abckcookie string, bmszcookie string) (*http.Response, error) {
	config := tls.Config{ServerName: hostname, InsecureSkipVerify: true}
	dialConn, err := net.DialTimeout("tcp", addr, dialTimeout)
	if err != nil {
		return nil, fmt.Errorf("net.DialTimeout error: %+v", err)
	}
	uTlsConn := tls.UClient(dialConn, &config, tls.HelloChrome_83)
    defer uTlsConn.Close()


	if err != nil {
		return nil, fmt.Errorf("uTlsConn.Handshake() error: %+v", err)
	}

	err = uTlsConn.Handshake()
	if err != nil {
		return nil, fmt.Errorf("uTlsConn.Handshake() error: %+v", err)
	}

	return httpGetOverConn(uTlsConn, uTlsConn.HandshakeState.ServerHello.AlpnProtocol, sensor_data, abckcookie, bmszcookie)}

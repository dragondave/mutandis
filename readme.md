* Import the script immediately after the body tag or whichever top-level tag you're using
  Mutandis won't catch any URLs created before it's imported.
* The URL we are serving contains ".zip/" and files will be served relative to that point
* There are potential collisions between domains and files: (e.g. http://foo.com/x and /foo.com/x)

If webpage `https://foo.com/71.zip/en/foo.html`
then ziproot/ is foo.com/71.zip/ -- note trailing /

                orig. URL | JS                  | Zip File
                ----------| --------------------| --------
                      baz | baz                 | en/baz
                     /baz | ziproot/baz         | baz
       http://wub.org/wug | ziproot/wub.org/wug | wub.org/wug
               /a?b=c&d=e | ziproot/a_b=c_d=e   | a_b=c_d=e
                     /%21 | ziproot/%21         | ! <<- special
                     /q#n | ziproot/q#n         | q <<- special
       
Contemplate adding: `<link href="...">` support (CSS)

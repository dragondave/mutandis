import re
import sys
#import urllib
import requests
import os
import shutil
import requests

#url_opener = urllib.URLopener()
target_directory, domain = sys.argv[1:]
assert target_directory.endswith(".zip/")

def write_url(url, filename):
    response = requests.get(url, stream=True)
    response.raw.decode_content = True
    with open(filename, 'wb') as out_file:
        shutil.copyfileobj(response.raw, out_file)

def get_input():
    data = []
    print ("Paste log then press CTRL-D to quit.")
    while True:
        try:
            line = raw_input()
            data.append(line)
        except EOFError:
            return data

def parse_log(log):
    # we are assuming the input is from Chrome
    not_found_urls = set()
    mutated_urls = {}
    for line in log:
        if "MUTANDIS|" in line:
            _, full_url, original_url, new_url = line.split("|")
            full_url = full_url.replace("http://localhost:8000", domain)
            mutated_urls[new_url] = full_url
        if "404 (File not found)" in line:
            not_found_url = (re.search("GET (.*) 404", line).group(1))
            not_found_urls.add(not_found_url)

    # At this point we have mutated_urls and not_found_urls
    # We now identify urls that were mutated and 404'd after mutation, then
    # fetch the relevant file and put it in the right place in the zip file
    broken_files = []
    for new_url, full_url in mutated_urls.items():
        if new_url in not_found_urls:
            broken_files.append([new_url.partition(".zip/")[2], full_url])

    # now for each broken file download the file into the right place
    for filename, url in broken_files:
        print ("Downloading {} to {}".format(url, target_directory+filename))
        pathname = '/'.join((target_directory+filename).split("/")[:-1])
        try:
            os.makedirs(pathname)
        except OSError as e:
            if e.errno != 17: raise e # file exists
        write_url(url, target_directory+filename)
        #url_opener.retrieve(url, target_directory+filename)


"""
Mutated /js/libs/modernizr-2.6.2.min-ck.js into http://localhost:8000/nasa.zip/js/libs/modernizr-2.6.2.min-ck.js
mutandis.js:49 MUTANDIS|http://localhost:8000/js/libs/modernizr-2.6.2.min-ck.js|/js/libs/modernizr-2.6.2.min-ck.js|http://localhost:8000/nasa.zip/js/libs/modernizr-2.6.2.min-ck.js
localhost/:16 GET http://localhost:8000/css/css/all-styles.css?v=10 404 (File not found)
localhost/:17 GET http://localhost:8000/css/css/generic.css?v=1 404 (File not found)
localhost/:21 GET http://localhost:8000/js/libs/modernizr-2.6.2.min-ck.js 404 (File not found)
localhost/:23 GET http://localhost:8000/js/libs/jquery-ui-1.8.13.custom.min.js 404 (File not found)
localhost/:24 GET http://localhost:8000/js/libs/jquery.beforeafter-1.4.min.js 404 (File not found)
"""

if __name__ == "__main__":
    chrome_log = get_input()
    parse_log(chrome_log)

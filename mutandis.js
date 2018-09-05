var modify_url = function(url) {
    /* if webpage https://foo.com/71.zip/en/foo.html
  then ziproot/ = ^^^^^^^^^^^^^^^^^^^^^^^ -- note trailing /

                orig. URL | JS                  | Zip File
                      baz | baz                 | en/baz
                     /baz | ziproot/baz         | baz
       http://wub.org/wug | ziproot/wub.org/wug | wub.org/wug
               /a?b=c&d=e | ziproot/a_b=c_d=e   | a_b=c_d=e
                     /%21 | ziproot/%21         | ! <<- special
                     /q#n | ziproot/q#n         | q <<- special
       
    POST requests aren't compatible. :(  */
    [_, ziproot, remainder] = window.location.href.match(/(.*\.zip\/)(.*)/)
    // if contains // or / append rest to ziproot
    double_slash = url.match(/\/\/(.*)/)
    single_slash = url.match(/\/(.*)/)
    if (double_slash) { // https://x -> ziproot/x
        new_url = ziproot + double_slash[1]
    } else if (single_slash) { // /x -> ziproot/x
        new_url = ziproot + single_slash[1]
    } else {
        // preserve as-is if no leading / nor https:// 
        new_url = url
    }
    final_url = new_url.replace(/[?&]/g, '_'); // replace query params with underscores
    console.log("Mutated "+url+ " into "+final_url);
    return final_url
}

var ELEMENT_NODE = 1;
var MAX_ATTR = Number.MAX_VALUE;  // change if debugging cascading attribute changes
var attribute_count = 0;
// Select the node that will be observed for mutations
var targetNode = document.getElementsByTagName("body")[0];

// Options for the observer (which mutations to observe)
var config = { attributes: true, childList: true, subtree: true, attributeFilter:["src"] };

// Callback function to execute when mutations are observed
var callback = function(mutationsList) {
    for(var mutation of mutationsList) {
        // childList: nodes probably added
        if (mutation.type == 'childList') { 
            for(var child of mutation.addedNodes) {
                if (child.nodeType === ELEMENT_NODE && child.hasAttribute("src")) {
                    var new_url = modify_url(child.getAttribute("src"));
                    var mutandis_src = document.createAttribute("mutandis_src");
                    mutandis_src.value=new_url;
                    child.setAttributeNode(mutandis_src);
                    child.setAttribute("src", new_url);
                }
            }
        }
        // attributes: attributes modified -- only src due to attributeFilter above
        else if (mutation.type == 'attributes') {
            attribute_count = attribute_count + 1;
            var old_mutandis_src = mutation.target.getAttribute("mutandis_src");
            var old_src = mutation.target.getAttribute("src");
            // only modify changes that we didn't create, and don't change too many!
            if (old_src !== old_mutandis_src && MAX_ATTR > attribute_count) {
                var new_url = modify_url(old_src);
                var mutandis_src = document.createAttribute("mutandis_src");
                mutandis_src.value = new_url;
                mutation.target.setAttributeNode(mutandis_src);
                mutation.target.setAttribute("src", new_url);
            }
        }
    }
};

// Create an observer instance linked to the callback function
var observer = new MutationObserver(callback);

// Start observing the target node for configured mutations
observer.observe(targetNode, config);

// Later, you can stop observing
// observer.disconnect();

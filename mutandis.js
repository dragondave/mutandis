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
var ATTRS = ["src", "href"]
var attribute_count = 0;
// Select the node that will be observed for mutations
var targetNode = document.getElementsByTagName("html")[0];

// Options for the observer (which mutations to observe)
var config = { attributes: true, childList: true, subtree: true, attributeFilter: ATTRS };

// Callback function to execute when mutations are observed
var callback = function(mutationsList) {
    for(var mutation of mutationsList) {
        // console.log(mutation);
        // childList: nodes probably added
        if (mutation.type == 'childList') {
            for(var child of mutation.addedNodes) {
                for(var attr of ATTRS) {
                  if (child.nodeType === ELEMENT_NODE && child.hasAttribute(attr)) {
                      var new_url = modify_url(child.getAttribute(attr));
                      var mutandis_attr = document.createAttribute("mutandis_"+attr);
                      if (attr === "src") {
                        console.log("MUTANDIS|"+child.src+"|"+child.getAttribute(attr)+"|"+new_url)
                      } else {
                        console.log("MUTANDIS|"+child.href+"|"+child.getAttribute(attr)+"|"+new_url)}; 
                      mutandis_attr.value=new_url;
                      child.setAttributeNode(mutandis_attr);
                      child.setAttribute(attr, new_url);
                  }
                }
            }
        }
        // attributes: attributes modified -- only src due to attributeFilter above
        else if (mutation.type == 'attributes') {
            var attr = mutation.attributeName
            attribute_count = attribute_count + 1;
            var old_mutandis_attr = mutation.target.getAttribute("mutandis_"+attr);
            var old_attr = mutation.target.getAttribute(attr);
            // only modify changes that we didn't create, and don't change too many!
            if (old_attr !== old_mutandis_attr && MAX_ATTR > attribute_count) {
                var new_url = modify_url(old_attr);
                var mutandis_attr = document.createAttribute("mutandis_"+attr);
                if (attr === "src") {
                  console.log("MUTANDIS|"+mutation.target.src+"|"+mutation.target.getAttribute(atttr)+"|"+new_url) } else {
                  console.log("MUTANDIS|"+mutation.target.href+"|"+mutation.target.getAttribute(attr)+"|"+new_url) };
                mutandis_attr.value = new_url;
                mutation.target.setAttributeNode(mutandis_attr);
                mutation.target.setAttribute(attr, new_url);
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

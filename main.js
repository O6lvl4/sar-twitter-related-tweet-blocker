// --- ENVIRONMENT ---

const getLocation = (path) => {
  if (typeof window !== "undefined") {
    return window.location;
  } else {
    // get it to run in node
    const _path = path !== undefined ? path : "/";
    return {
      protocol: "https",
      host: "LOCAL",
      pathname: _path,
      href: `${protocol}://${host}${_path}`
    }
  }
}

function nestedDOMElement(element, nestCount, nestElement) {
  if (nestCount === 0) {
    return element;
  }
  if (typeof nestElement === "undefined") {
    nestElement = element;
  }
  nestElement.parentElement = element;
  return nestedDOMElement(element, nestCount - 1, nestElement.parentElement);
}

class DummyDOMElement {
  constructor(innerText) {
    this.innerText = innerText;
    this.style = {
      display: true
    };
  }
}

class DummyDOM {
  constructor(tweetTextSet) {
    this.tweetTextSet = tweetTextSet;
    this.tweetDomElements = this.tweetTextSet.map((label) => {
      return nestedDOMElement(new DummyDOMElement(label), 6)
    })
  }
  getElementsByClassName = (selector) => {
    return this.tweetDomElements
  }
}

const getDocument = () => {
  if (typeof document !== "undefined") {
    return document;
  } else {
    // get it to run in node
    const dummyData = [
      "First tweet",
      "Second tweet",
      "関連ツイート",
      "Relative first tweet",
      "Relative second tweet"]
    return new DummyDOM(dummyData);
  }
}

// --- SOLVE ---

const observeURLChanged = (initialLocation, locationFetcher, listener) => {
  console.log("observeURLChanged location: ", initialLocation)
  if (typeof MutationObserver !== "undefined") {
    var previousLocation = undefined;
    var observing = false;
    var observingLocation = initialLocation;
    var observer =  new MutationObserver(() => {
        if (previousLocation !== undefined) {
          var currentLocation = locationFetcher();
          if (currentLocation !== previousLocation) {
            previousLocation = observingLocation;
            observingLocation = currentLocation;
            observing = true;
          }
        } else {
          previousLocation = observingLocation;
        }
        if (observing) {
          listener(locationFetcher(), () => {
            observing = false;
          });
        }
    });
    observer.observe(document, {
      subtree: true,
      childList: true
    });
  } else {
    // get it to run in node
    console.log("dummy to once observing");
    const dummyPath = "/local_exec/status/2389281184103543863";
    listener(getLocation(dummyPath));
  }
}

const isDetailPage = (location) => {
  var pathnames = location.pathname.split("/");
  if (pathnames > 2) {
    pathnames.shift()
  }
  return pathnames.indexOf("status") === 2;
}

const removeRelativeTweet = (document) => {
  // Using in related text tweet.
  const targetStylePattern = "css-901oao css-16my406 r-1tl8opc r-bcqeeo r-qvutc0";
  const elements = document.getElementsByClassName(targetStylePattern);
  if (!elements) {
    return true;
  }
  var hasRelativeTweet = false;
  var idx = -1;
  var removeCount = 0;
  for (const element of elements) {
    idx++;
    if (element.innerText === "関連ツイート") {
      hasRelativeTweet = true;
    } else if (hasRelativeTweet) {
      removeCount += 1;
      element.parentElement
        .parentElement
        .parentElement
        .parentElement
        .parentElement
        .style.display = 'none';
    }
  }
  // TODO: Should remove image only related tweet.
  if (removeCount > 0) {
    console.log("removeCount: ", removeCount);
  }
  return removeCount > 0;
}

// --- MAIN ---

const main = () => {
  var location = getLocation();
  var domDocument = getDocument();
  observeURLChanged(location.href, () => location.href, (next, removed) => {
    if (isDetailPage(location)) {
      if (removeRelativeTweet(domDocument)) {
        removed();
      }
    }
  });
}

main();

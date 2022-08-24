// --- ENVIRONMENT ---

const getLocation = (path) => {
  if (typeof window !== "undefined") {
    return window.location;
  } else {
    // get it to run in node
    const protocol = "https"
    const _path = path !== undefined ? path : "/";
    const host = "LOCAL"
    return {
      protocol: "https",
      host: host,
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
    const dummyData = ["First tweet", "Second tweet", "関連ツイート", "Relative first tweet", "Relative second tweet"]
    return new DummyDOM(dummyData);
  }
}

// --- SOLVE ---

const observeURLChanged = (location, listener) => {
  if (typeof MutationObserver !== "undefined") {
    var previousUrl = "";
    var observer =  new MutationObserver(() => {
      previousUrl = location.href;
    });
    var intervalId = undefined;
    if (intervalId) {
      clearInterval(intervalId);
    }
    intervalId = setInterval(() => {
      listener(location);
    }, 1000);
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
  var pathname = location.pathname;
  // TODO: Using regex pattern
  var pathcount = pathname.split("/").length;
  return pathcount > 2;
}

const removeRelativeTweet = (document) => {
  // Using in related text tweet.
  const elements = document.getElementsByClassName("css-901oao css-16my406 r-1tl8opc r-bcqeeo r-qvutc0");
  if (!elements) {
    return;
  }
  
  var hasRelativeTweet = false;
  var idx = -1;
  for (const element of elements) {
    idx++;
    if (element.innerText === "関連ツイート") {
      hasRelativeTweet = true;
    } else if (hasRelativeTweet) {
      element.parentElement.parentElement.parentElement.parentElement.parentElement.style.display = 'none';
    }
  }
  // TODO: Should remove image only related tweet.
}

// --- MAIN ---

const main = () => {
  var location = getLocation();
  var domDocument = getDocument();
  observeURLChanged(location, (next) => {
    console.log(`URL changed to ${next.href}`);
    if (isDetailPage(next)) {
      console.log("relative tweets dead.");
      removeRelativeTweet(domDocument);
    }
  });
}

main();

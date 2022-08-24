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
      listener(window.location);
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

// --- SOLVE ---

const isDetailPage = (location) => {
  var pathname = location.pathname;
  // TODO: Using regex pattern
  var pathcount = pathname.split("/").length;
  return pathcount > 2;
}

function removeRelativeTweet(document) {
  // NOTE: class="css-901oao css-16my406 r-1tl8opc r-bcqeeo r-qvutc0"
  const elements = document.getElementsByClassName("css-901oao css-16my406 r-1tl8opc r-bcqeeo r-qvutc0");
  console.log(elements);
  if (!elements) {
    return false
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
  if (hasRelativeTweet) {
    const imageOnlyElements = document.getElementsByClassName("css-1dbjc4n r-1awozwy r-1p0dtai r-1777fci r-1d2f490 r-u8s1d r-zchlnj r-ipm5af")
    for (const element of imageOnlyElements) {
      element.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.style.display = 'none';
    }
  }
}

// --- MAIN ---

const main = () => {
  var location = getLocation();
  if (isDetailPage(location)) {
    removeRelativeTweet(document);
  }
  observeURLChanged(location, (next) => {
    console.log(`URL changed to ${next.href}`);
    if (isDetailPage(next)) {
      console.log("relative tweets dead.");
      removeRelativeTweet(document);
    }
  });
}

main();

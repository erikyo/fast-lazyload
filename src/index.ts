/**
 * Check if an element is in the viewport
 *
 * @param el {Element} The element to check
 * @return {boolean} True if the element is in the viewport
 */
export function isElementInViewport(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();

  // Check if any part of the element is in the viewport
  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
    rect.top < (window.innerHeight || document.documentElement.clientHeight)
  );
}

/**
 * Show the background image
 *
 * @param lazyBackground
 */
export function unveil(lazyBackground: HTMLElement) {
    if (lazyBackground.hasAttribute('style') && (lazyBackground as HTMLDivElement).style.backgroundImage) {
        lazyBackground.style.backgroundImage = `url(${lazyBackground.dataset.lazy})`;
    } else if (lazyBackground.hasAttribute('src')) {
        (lazyBackground as HTMLImageElement).src = lazyBackground.dataset.lazy;
    }
    lazyBackground.removeAttribute('data-lazy');
}

/**
 * Define the lazy loading function
 *
 * @param entries The entries from the IntersectionObserver
 * @param observer The IntersectionObserver instance
 */
export function lazyLoadBackgrounds(entries: IntersectionObserverEntry[], observer: IntersectionObserver) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            unveil(entry.target as HTMLElement)
            entry.target.classList.add('lazy-background-on');
            observer.unobserve(entry.target);
        }
    });
}

/**
 * Fallback for browsers that don't support Intersection Observer
 * @param {Element} node The node to fallback
 */
export function fallbackNode(node: HTMLElement) {
    unveil(node);
    node.classList.remove('lazy-background');
    node.classList.add('lazy-background-failed');
}

/**
 *  Start the lazy loading
 *  - Create an IntersectionObserver instance
 *  - Create a MutationObserver to watch for changes in the DOM
 *  - Start observing the DOM for changes before the page is loaded
 *  - Unveil elements in the viewport
 *  - Observe elements in outside the viewport
 *  - Fallback for browsers that don't support Intersection Observer
 */
export function fastLazyLoad() {
    const lazyElements = document.querySelectorAll('[data-lazy]');

    /**
     * Create an IntersectionObserver instance and observe the lazy elements
     */
    if ('IntersectionObserver' in window && 'MutationObserver' in window) {
        const lazyObserver = new IntersectionObserver(lazyLoadBackgrounds);


        // Observe elements with lazy backgrounds
        lazyElements.forEach(lazyBackground => {
            lazyObserver.observe(lazyBackground);
        });

        // Create a MutationObserver to watch for changes in the DOM
        const observer = new MutationObserver(mutationsList => {
            for (let mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node: HTMLElement) => {
                        if (node.nodeType === 1 && node.matches('[data-lazy]')) {
                            if (isElementInViewport(node)) {
                                unveil(node)
                            } else {
                                // Observe the newly added node with the IntersectionObserver
                                lazyObserver.observe(node);
                            }
                        }
                    });
                }
            }
        });

        /**
         * Start observing the DOM
          */
        observer.observe(document.body, {childList: true, subtree: true});
    } else {
        /**
         * Fallback for browsers that don't support Intersection Observer
         *
         * @type {NodeListOf<Element>}
         */
        lazyElements.forEach((lazyBackground: HTMLElement) => {
            fallbackNode(lazyBackground);
        });
    }
}

// IIFE to prevent global variables interference
(() => fastLazyLoad())();

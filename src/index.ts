/**
 * If needed, you can set the lazyloadOptions in the window object before the document is loaded to override the default options
 *
 * @example window.lazyloadOptions = {loading: 'my-lazy-loading', failed: 'my-lazy-failed', on: 'my-lazy', loaded: 'my-lazy-loaded', attribute: 'lazy' }
 */
type LazyloadOptions = {loading: string, failed: string, on: string, loaded: string, attribute: string}
const Options = 'lazyloadOptions' in window ? window?.lazyloadOptions as LazyloadOptions : {loading: 'lazy-loading', failed: 'lazy-failed', on: 'lazy', loaded: 'lazy-loaded', attribute: 'lazy'}

/**
 * Check if an element is in the viewport
 *
 * @param el {Element} The element to check
 * @return {boolean} True if the element is in the viewport
 */
export function isElementInViewport(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect()

    // Check if any part of the element is in the viewport
    return (
        rect.bottom > 0 &&
    rect.right > 0 &&
    rect.left < (window.innerWidth || document.documentElement.clientWidth) &&
    rect.top < (window.innerHeight || document.documentElement.clientHeight)
    )
}

/**
 * Show the background image
 *
 * @param lazyBackground
 */
export function unveil(lazyBackground: HTMLElement) {
    // Add the background image to the element if it exists else add the src
    if (lazyBackground.hasAttribute('style') && (lazyBackground as HTMLDivElement).style.backgroundImage) {
        lazyBackground.style.backgroundImage = `url(${lazyBackground.dataset.lazy})`
    } else {
        (lazyBackground as HTMLImageElement).src = lazyBackground.dataset.lazy as string
    }
    // Remove the data-lazy attribute
    lazyBackground.removeAttribute('data-' + Options.attribute)
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
            const target = entry.target as HTMLElement
            // Adds the 'on' class if the image is in the viewport
            entry.target.classList.add(Options.on)
            // Adds the 'on' class after the image is loaded
            target.addEventListener('load', () => {
                entry.target.classList.add(Options.loaded)
                entry.target.classList.remove(Options.loading)
            })
            // Adds the 'failed' class if the image fails to load
            target.addEventListener('error', () => {
                entry.target.classList.add(Options.failed)
            })
            // Adds the 'loading' class until the image is loaded
            entry.target.classList.add(Options.loading)
            unveil(entry.target as HTMLElement)
            observer.unobserve(entry.target)
        }
    })
}

/**
 * Fallback for browsers that don't support Intersection Observer
 * @param {Element} node The node to ensure is visible
 */
export function fallbackNode(node: HTMLElement) {
    unveil(node)
    node.classList.add(Options.loaded)
}

/**
 * Add a script tag to the page
 * @param node the script node
 */
function lazyscript(node: HTMLScriptElement) {
    // Lazy load the script in the background after the page is loaded
    window.addEventListener( 'load', () => {
        const script = document.createElement('script')
        // copy the attributes
        for (let i = 0; i < node.attributes.length; i++) {
            if (node.attributes[i].name === 'data-' + Options.attribute) script.setAttribute(node.attributes[i].name, node.attributes[i].value)
        }
        // set the src
        script.src = node.dataset.lazy as string
        // add the script to the page in the same position as the old script node
        node.parentElement?.insertBefore(script, node)
        node.remove()
    } )
}

/**
 *  Start the lazy loading
 *
 *  @type {NodeListOf<Element>} lazyElements The elements to lazy load *
 */
export function fastLazyLoad() {
    const lazyElements = document.querySelectorAll(`[data-${Options.attribute}]`)

    /**
     * Create an IntersectionObserver instance and observe the lazy elements
     */
    if ('IntersectionObserver' in window && 'MutationObserver' in window) {
        const lazyObserver = new IntersectionObserver(lazyLoadBackgrounds)

        // Observe elements with lazy backgrounds
        lazyElements.forEach(lazyBackground => {
            lazyObserver.observe(lazyBackground)
        })

        // Create a MutationObserver to watch for changes in the DOM
        const observer = new MutationObserver(mutationsList => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node: Node) => {
                        if (node.nodeType === 1 && (node as HTMLElement).matches(`[data-${Options.attribute}]`)) {
                            const isElement = node as HTMLElement | HTMLScriptElement
                            if (isElement.nodeName === 'SCRIPT') {
                                lazyscript(isElement as HTMLScriptElement)
                            } else if (isElementInViewport(isElement)) {
                                unveil(isElement)
                                if (isElement.nodeName === 'IMG' || isElement.nodeName === 'VIDEO') {
                                    // add the fetchpriority="high" attribute to the image/videos if it doesn't have already
                                    isElement.hasAttribute( 'fetchpriority' ) || isElement.setAttribute( 'fetchpriority', 'high' )
                                }
                            } else {
                                // Observe the newly added node with the IntersectionObserver
                                lazyObserver.observe(isElement)
                            }
                        }
                    })
                }
            }
        })

        /**
         * Start observing the DOM
          */
        observer.observe(document.body, {childList: true, subtree: true})
    } else {
        /**
         * Fallback for browsers that don't support Intersection Observer
         *
         * @type {NodeListOf<Element>}
         */
        lazyElements.forEach((lazyBackground) => {
            fallbackNode(lazyBackground as HTMLElement)
        })
    }
}

/* we call the script as an IIFE to prevent global variables pollution */
(() => fastLazyLoad())()

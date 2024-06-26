/**
 * If needed, you can set the lazyloadOptions in the window object before the document is loaded to override the default options
 *
 * @example window.lazyloadOptions = {loading: 'my-lazy-loading', failed: 'my-lazy-failed', on: 'my-lazy', loaded: 'my-lazy-loaded', attribute: 'lazy' }
 */
type LazyloadOptions = { loading: string, failed: string, on: string, loaded: string, attribute: string }
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
 * @param lazyElement
 */
export function unveil(lazyElement: HTMLElement) {
    // Add the background image to the element if it exists else add the src
    if (lazyElement.hasAttribute('style') && (lazyElement as HTMLDivElement).style.backgroundImage) {
        lazyElement.style.backgroundImage = `url(${lazyElement.dataset[Options.attribute]})`
    } else {
        // Add the src to the element
        (lazyElement as HTMLImageElement).src = lazyElement.dataset[Options.attribute] as string
        // If the srcset attribute exists add it
        if ([Options.attribute] + '-srcset' in lazyElement.dataset)
            (lazyElement as HTMLImageElement).srcset = lazyElement.dataset[Options.attribute] + '-srcset' as string
    }
    // Remove the data-lazy attribute
    lazyElement.removeAttribute('data-' + Options.attribute)
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
    window.addEventListener('load', () => {
        const script = document.createElement('script')
        // copy the attributes
        for (let i = 0; i < node.attributes.length; i++) {
            if (node.attributes[i].name === 'data-' + Options.attribute) script.setAttribute(node.attributes[i].name, node.attributes[i].value)
        }
        // set the src
        script.src = node.dataset[Options.attribute] as string
        // add the script to the page in the same position as the old script node
        node.parentElement?.insertBefore(script, node)
        node.remove()
    })
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
        lazyElements.forEach(lazyElement => {
            lazyObserver.observe(lazyElement)
        })

        // Create a MutationObserver to watch for changes in the DOM
        const observer = new MutationObserver(mutationsList => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node: Node) => {
                        // Check if the node is a lazy element
                        if (node.nodeType === 1 && (node as HTMLElement).matches(`[data-${Options.attribute}]`)) {
                            /** @var  {HTMLElement | HTMLScriptElement} isElement the element to lazy load */
                            const isElement = node as HTMLElement | HTMLScriptElement
                            if (isElement.nodeName === 'SCRIPT') {
                                // If the element is a script tag, load the script in the background
                                lazyscript(isElement as HTMLScriptElement)
                            } else if (isElementInViewport(isElement)) {
                                // If the element is in the viewport, show it
                                unveil(isElement)
                                if (isElement.nodeName === 'IMG' || isElement.nodeName === 'VIDEO') {
                                    // add the fetchpriority="high" attribute to the image/videos if it doesn't have already
                                    isElement.hasAttribute('fetchpriority') || isElement.setAttribute('fetchpriority', 'high')
                                }
                            } else {
                                // Else observe the newly added node with the IntersectionObserver
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
        lazyElements.forEach((lazyElement) => {
            fallbackNode(lazyElement as HTMLElement)
        })
    }
}

/* we call the script as an IIFE to prevent global variables pollution */
(() => fastLazyLoad())()

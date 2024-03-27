# Fast Lazy Load
[![](https://img.shields.io/npm/v/gettext-merger.svg?label=npm%20version)](https://www.npmjs.com/package/gettext-merger)
[![](https://img.shields.io/npm/l/gettext-merger)](https://github.com/erikyo/gettext-merger?tab=GPL-3.0-1-ov-file#readme)

### Lazy Load Images, Videos, and Backgrounds Using Mutation Observer

This script provides a way to lazily load images, videos, and background images efficiently by utilizing the Intersection Observer API and Mutation Observer API. It focuses on optimizing performance by loading content only when it enters the viewport, thereby reducing unnecessary network requests and improving the overall user experience. Notably, this approach ensures that lazy-loaded content appears with the same Cumulative Layout Shift (CLS) timing as the non-lazy-loaded version, contributing to a seamless browsing experience.

## Features

- Lazy loads images, videos, and background images.
- Utilizes Intersection Observer to efficiently detect when elements enter the viewport.
- Employs Mutation Observer to dynamically handle changes in the DOM, ensuring newly added lazy elements are also properly observed.
- Provides a fallback mechanism for browsers that do not support Intersection Observer.

## Usage

### Installation

1. Include the script at the beginning of the `<body>` tag in your HTML document.
2. Ensure the script is added before any content that requires lazy loading.

### Code Structure

- `isElementInViewport(el)`: Function to check if an element is in the viewport.
- `unveil(lazyBackground)`: Function to reveal lazy-loaded content.
- `lazyLoadBackgrounds(entries, observer)`: Function to lazy load background images using Intersection Observer.
- `fallbackNode(node)`: Function to provide a fallback mechanism for browsers lacking Intersection Observer support.
- Immediately Invoked Function Expression (IIFE): Ensures encapsulation and prevents global variable pollution.
- Initialization: Initializes the lazy loading mechanism by creating Intersection Observer and Mutation Observer instances.

### Compatibility

- The script is designed to work in modern browsers that support both Intersection Observer and Mutation Observer APIs.
- A fallback mechanism is provided for browsers that do not support Intersection Observer, ensuring basic functionality across a wide range of browsers.

## How It Works

1. The script initially queries for all elements with the `data-lazy` attribute, which are considered lazy-loadable elements.
2. If the browser supports Intersection Observer and Mutation Observer, it creates instances of both.
3. Intersection Observer is used to monitor lazy-loadable elements and trigger loading when they enter the viewport.
4. Mutation Observer watches for changes in the DOM, ensuring any dynamically added lazy elements are also properly observed.
5. For browsers lacking Intersection Observer support, a fallback mechanism directly loads all lazy elements.

## Caveats

- The script relies on the availability of Intersection Observer and Mutation Observer APIs. Ensure compatibility with your target browsers.
- It's essential to use the `data-lazy` attribute on elements you intend to lazy load.

## Contributing

If you encounter any issues or have suggestions for improvements, feel free to contribute by submitting a pull request or opening an issue on the GitHub repository.

## License

This script is licensed under the [MIT License](https://opensource.org/licenses/MIT). You are free to modify and distribute it as per the terms of the license.

## Acknowledgments

Special thanks to the developers and contributors of Intersection Observer and Mutation Observer APIs for enabling efficient lazy loading techniques.

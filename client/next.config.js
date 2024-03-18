//this file is loaded up automatically whenever our nextjs project starts up
//next will then attempt to read this in, and look at webpack dev middleware function
// and its going to call it with some webpack configuration that it has created by default
//we are changing a single option, to make it so that webpack will poll all files every 300ms

module.exports = {
    webpackDevMiddleware: config => {
        config.watchOptions.poll = 300;
        return config;
    }
}
const Router = require('./router')

addEventListener('fetch', event => {
        event.respondWith(handleRequest(event.request))
    })
    /**
     * Respond with hello worker text
     * @param {Request} request
     */
async function handleRequest(request) {
    url = 'https://cfw-takehome.developers.workers.dev/api/variants'
    var response = await fetch(url)
    console.log(response)
    let body = await response.json()
    var links = body.variants
    let finalResponse;
    const NAME = 'experiment-variants'
    const cookie = request.headers.get('cookie')
    if (cookie && cookie.includes(`${NAME}=v1`)) {
        finalResponse = await fetch(links[0], request)
    } else if (cookie && cookie.includes(`${NAME}=v2`)) {
        finalResponse = await fetch(links[1], request)
    } else {
        // if no cookie then this is a new client, decide a group and set the cookie
        let group = Math.floor(Math.random() * 2)
        finalResponse = await fetch(links[group], request)
        finalResponse = new Response(finalResponse.body, finalResponse)
        console.log('finalResponse', finalResponse)
        finalResponse.headers.append('Set-Cookie', `${NAME}=v${group+1}; path=/`)
    }
    return rewriter.transform(finalResponse)
}

const OLD_URL = 'cloudflare.com'
const NEW_URL = 'github.com/pkhambat1'
const OLD_TITLE = 'Variant '
const NEW_TITLE = "Persistent Variant #"
const OLD_DESCRIPTION = "of the take home project!"
const NEW_DESCRIPTION = "Changed description for extra credit"

class AttributeRewriter {
    constructor(attributeName) {
        this.attributeName = attributeName
    }
    element(element) {
        const attribute = element.getAttribute(this.attributeName)
        if (element.tag === 'a' && attribute === 'href') {
            element.setAttribute(
                this.attributeName,
                attribute.replace(OLD_URL, NEW_URL)
            )
        }
    }
    text(element) {
        var text = element.text;
        if (text.includes(OLD_URL)) {
            text = text.replace(OLD_URL, NEW_URL)
        } else if (text.includes(OLD_TITLE)) {
            text = text.replace(OLD_TITLE, NEW_TITLE)
        } else if (text.includes(OLD_DESCRIPTION)) {
            text = NEW_DESCRIPTION
        }
        element.replace(text)
    }
}

const rewriter = new HTMLRewriter()
    .on('title', new AttributeRewriter())
    .on('h1#title', new AttributeRewriter())
    .on('p#description', new AttributeRewriter())
    .on('a#url', new AttributeRewriter('href'))
    .on('a#url', new AttributeRewriter())
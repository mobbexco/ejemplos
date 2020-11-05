const mobbexSources = (...args) => {
    let tax_id
    let country
    let token
    let url
    let total

    if (args.length === 3) {
        country = args[0]
        tax_id = args[1]
        total = args[2]

        url = `https://api.mobbex.com/p/sources/list/${country}/${tax_id}?total=${total}`
    }
    else {
        token = args[0]
        total = args[1]

        url = `https://api.mobbex.com/p/sources/list/${token}?total=${total}`
    }

    let request = new XMLHttpRequest()

    request.addEventListener("readystatechange", function () {
        if (request.readyState == 4 && request.status == 200) {
            let sources = JSON.parse(this.responseText)
            renderSources(sources.data)
        }
    })

    request.open("GET", url)
    request.send(null)
}

const renderSources = (sources) => {

    let errorMessage = "No se encontrar medios de pago. Revisar que los argumentos sean correctos"

    if (typeof sources === 'undefined') return console.error(errorMessage)

    let baseUrl = `https://res.mobbex.com/images/sources/`

    let mobbexDiv = document.getElementById("mbbx-sources")
    

    //Style

    let div = document.getElementById("mbbx-sources")
    div.style.overflow = 'auto'
    div.style.whiteSpace = 'nowrap'

    sources.forEach(source => {
        let img = document.createElement("img")
        img.src = baseUrl + source.source.reference + '.png'
        img.classList = 'mbbx-source'
        img.style.margin = '0 5px'
        mobbexDiv.appendChild(img)
    })

    if (document.getElementsByClassName("mbbx-rounded").length > 0) mobbexRound()
}

const mobbexRound = () => {
    let rounded = document.getElementsByClassName("mbbx-rounded")[0]
    let images = rounded.getElementsByTagName("img")
    for (let i = 0; i < images.length; i++) {
        images[i].style.borderRadius = '50%'
    }
}
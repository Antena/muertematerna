(function() {
    glossary = {};

    var terms = [
        { key: "rmm", title: "Razón de Muerte Materna", content: "La Razón de Mortalidad Materna se define como el número de muertes maternas en una población dividida por el número de nacidos vivos. Indica el riesgo de muerte materna en relación con el número de nacimientos (World Health Organization, 2007)." }
    ];

    glossary.getTitle = function(key) {
        return terms.filter(function(term) { return term.key == key })[0].title;
    }

    glossary.getContent = function(key) {
        return terms.filter(function(term) { return term.key == key })[0].content;
    }

})()
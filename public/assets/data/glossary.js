(function() {
    glossary = {};

    var terms = [
        { key: "rmm", title: "Razón de Muerte Materna", content: "The maternal mortality rate (MMR) is the annual number of female deaths per 100,000 live births from any cause related to or aggravated by pregnancy or its management (excluding accidental or incidental causes). The MMR includes deaths during pregnancy, childbirth, or within 42 days of termination of pregnancy, irrespective of the duration and site of the pregnancy, for a specified year." }
    ];

    glossary.getTitle = function(key) {
        return terms.filter(function(term) { return term.key == key })[0].title;
    }

    glossary.getContent = function(key) {
        return terms.filter(function(term) { return term.key == key })[0].content;
    }

})()
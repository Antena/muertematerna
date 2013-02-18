(function() {
    provinces = {};

    var provinceArray = [
        {key: 'Buenos Aires', value: 1,
            departments: {file: "buenosaires.json", scale: 11000, center: [-60.566, -37.2]},
            zoomLocation: { x: -10.262613679925508, y: 55.13908237968489, k: 3.25}},
        {key: 'Catamarca', value: 2,
            departments: {file: "catamarca.json", scale: 18000, center: [-66.952, -27.6]},
            zoomLocation: {x: 60.51751378532765, y: 178.39683202528224, k: 4}},
        {key: 'Chaco', value: 3,
            zoomLocation: {x: -8.197135564735905, y: 190.2362675218981, k: 4}},
        {key: 'Chubut', value: 4,
            zoomLocation: {x: 78.12741016923607, y: -48.233265327752726, k: 4}},
        {key: 'Ciud. Aut. de  Buenos Aires', value: 5,
            zoomLocation:{x: -33.9395141320074, y: 84.09937360502019, k: 20}} ,
        {key: 'Córdoba', value: 6,
            zoomLocation: {x: 25.558180799210795, y: 116.61518530866319, k: 4}},
        {key: 'Corrientes', value: 7,
            zoomLocation: {x: -41.00192544990495, y: 160.313361317873, k: 4}},
        {key: 'Entre Ríos', value: 8,
            departments: {file: "entrerios.json", scale: 22000, center: [-59.208, -32.22]},
            zoomLocation: {x: -25.442897347780924, y: 118.11579366215383, k: 4}},
        {key: 'Formosa', value: 9,
            zoomLocation: {x: -17.47160090404908, y: 208.67680233895467, k: 4}},
        {key: 'Jujuy', value: 10,
            zoomLocation: {x: 47.35132588114778, y: 227.92945311718393, k: 4}},
        {key: 'La Pampa', value: 11,
            zoomLocation: {x: 43.88367070570077, y: 49.37379332281916, k: 4}},
        {key: 'La Rioja', value: 12,
            zoomLocation: {x: 63.0320368644745, y: 148.7362825677017, k: 4}},
        {key: 'Mendoza', value: 13,
            zoomLocation: {x: 78.77257165181865, y: 83.51160723558354, k: 4}} ,
        {key: 'Misiones', value: 14,
            zoomLocation: {x: -76.10387121654735, y: 184.26663952424258, k: 4}},
        {key: 'Neuquén', value: 15,
            zoomLocation: {x: 95.8175278659974, y: 28.06552419374777, k: 4}} ,
        {key: 'Río Negro', value: 16,
            zoomLocation: {x: 63.770288136828746, y: 2.619883357707074, k: 4}},
        {key: 'Salta', value: 17,
            zoomLocation: {x: 36.96218151449586, y: 215.9362653198231, k: 4}},
        {key: 'San Juan', value: 18,
            zoomLocation: {x: 81.94345613572776, y: 133.52931035069435, k: 4}},
        {key: 'San Luis', value: 19,
            zoomLocation: {x: 50.321284311148425, y: 95.19480963299873, k: 4}},
        {key: 'Santa Cruz', value: 20,
            zoomLocation: {x: 94.00511536863121, y: -129.93778266090325, k: 4}},
        {key: 'Santa Fe', value: 21,
            departments: {file: "santafe.json", scale: 14000, center: [-60.951, -31.2]},
            zoomLocation: {x: -6.0090172087551235, y: 135.12394188436474, k: 4}},
        {key: 'Santiago del Estero', value: 22,
            zoomLocation: {x: 19.553569305357566, y: 172.7488932167182, k: 4}},
        {key: 'Tierra del Fuego', value: 23,
            zoomLocation: {x: 65.49965885548255, y:-227.61906276727228, k:4}},
        {key: 'Tucumán', value: 24,
            zoomLocation: {x: 42.967983972762646, y: 183.4353299256579, k: 4}}
    ];

    provinces.getNames = function() {
        return provinceArray.map( function(item) { return item.key });
    }

    provinces.getByName = function(name) {
        return provinceArray.filter( function(item) { return item.key == name })[0];
    }

    provinces.getById = function(id) {
        return provinceArray.filter( function(item) { return item.value == id })[0];
    }
})()
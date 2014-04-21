(function() {
    provinces = {};


    var fertilityRate = {2006: '1.6', 2007: '1.6', 2008: '1.6', 2009: '1.6', 2010: '1.6', 2011: '1.6'};

    var provinceArray = [
        {key: 'Buenos Aires', value: 1,
            departments: {file: "buenosaires.json", scale: 11000, center: [-60.566, -37.2]},
            zoomLocation: { x: -10.262613679925508, y: 55.13908237968489, k: 3.25},
            fertilityRate: {2006: '2.05', 2007: '2.05', 2008: '2.05', 2009: '2.05', 2010: '2.05', 2011: '2.05',2012:'2.05'}},
        {key: 'Catamarca', value: 2,
            departments: {file: "catamarca.json", scale: 18000, center: [-66.952,-27.6]},
            zoomLocation: {x: 60.51751378532765, y: 178.39683202528224, k: 4},
            fertilityRate: {2006: '2.82', 2007: '2.82', 2008: '2.82', 2009: '2.82', 2010: '2.82', 2011: '2.82',2012: '2.82'}},
        {key: 'Chaco', value: 3,
            departments: {file: "chaco.json", scale: 19000, center: [-60.9,-26.2]},
            zoomLocation: {x: -8.197135564735905, y: 190.2362675218981, k: 4},
            fertilityRate: {2006: '2.5', 2007: '2.5', 2008: '2.5', 2009: '2.5', 2010: '2.5', 2011: '2.5',2012: '2.5'}},
        {key: 'Chubut', value: 4,
            departments: {file: "chubut.json", scale: 11000, center: [-67.9,-44]},
            zoomLocation: {x: 78.12741016923607, y: -48.233265327752726, k: 4},
            fertilityRate: {2006: '2.25', 2007: '2.25', 2008: '2.25', 2009: '2.25', 2010: '2.25', 2011: '2.25', 2012: '2.25'}},
        {key: 'Ciudad de  Buenos Aires', value: 5,
            departments: {file: "caba.json", scale: 450000, center: [-58.444,-34.618]},
            zoomLocation:{x: -33.9395141320074, y: 84.09937360502019, k: 20},
            fertilityRate: {2006: '1.63', 2007: '1.63', 2008: '1.63', 2009: '1.63', 2010: '1.63', 2011: '1.63',2012: '1.63'}} ,
        {key: 'Córdoba', value: 6,
            departments: {file: "cordoba.json", scale: 16000, center: [-63.8,-32.3]},
            zoomLocation: {x: 25.558180799210795, y: 116.61518530866319, k: 4},
            fertilityRate: {2006: '1.88', 2007: '1.88', 2008: '1.88', 2009: '1.88', 2010: '1.88', 2011: '1.88',2012: '1.88'}},
        {key: 'Corrientes', value: 7,
            departments: {file: "corrientes.json", scale: 23000, center: [-57.7,-29]},
            zoomLocation: {x: -41.00192544990495, y: 160.313361317873, k: 4},
            fertilityRate: {2006: '2.58', 2007: '2.58', 2008: '2.58', 2009: '2.58', 2010: '2.58', 2011: '2.58',2012: '2.58'}},
        {key: 'Entre Ríos', value: 8,
            departments: {file: "entrerios.json", scale: 22000, center: [-59.208,-32.22]},
            zoomLocation: {x: -25.442897347780924, y: 118.11579366215383, k: 4},
            fertilityRate: {2006: '2.4', 2007: '2.4', 2008: '2.4', 2009: '2.4', 2010: '2.4', 2011: '2.4',2012: '2.4'}},
        {key: 'Formosa', value: 9,
            departments: {file: "formosa.json", scale: 19000, center: [-59.934,-24.7]},
            zoomLocation: {x: -17.47160090404908, y: 208.67680233895467, k: 4},
            fertilityRate: {2006: '2.9', 2007: '2.9', 2008: '2.9', 2009: '2.9', 2010: '2.9', 2011: '2.9',2012: '2.9'}
        },
        {key: 'Jujuy', value: 10,
            departments: {file: "jujuy.json", scale: 28000, center: [-65.762,-23.4]},
            zoomLocation: {x: 47.35132588114778, y: 227.92945311718393, k: 4},
            fertilityRate: {2006: '2.6', 2007: '2.6', 2008: '2.6', 2009: '2.6', 2010: '2.6', 2011: '2.6',2012: '2.6'}},
        {key: 'La Pampa', value: 11,
            departments: {file: "lapampa.json", scale: 19000, center: [-65.8,-37.2]},
            zoomLocation: {x: 43.88367070570077, y: 49.37379332281916, k: 4},
            fertilityRate: {2006: '2.2', 2007: '2.2', 2008: '2.2', 2009: '2.2', 2010: '2.2', 2011: '2.2',2012: '2.2'}},
        {key: 'La Rioja', value: 12,
            departments: {file: "larioja.json", scale: 21000, center: [-67.5,-29.9]},
            zoomLocation: {x: 63.0320368644745, y: 148.7362825677017, k: 4},
            fertilityRate: {2006: '2.3', 2007: '2.3', 2008: '2.3', 2009: '2.3', 2010: '2.3', 2011: '2.3',2012: '2.3'}
        },
        {key: 'Mendoza', value: 13,
            departments: {file: "mendoza.json", scale: 15500, center: [-68.587,-34.8]},
            zoomLocation: {x: 78.77257165181865, y: 83.51160723558354, k: 4},
            fertilityRate: {2006: '2.3', 2007: '2.3', 2008: '2.3', 2009: '2.3', 2010: '2.3', 2011: '2.3',2012: '2.3'}} ,
        {key: 'Misiones', value: 14,
            departments: {file: "misiones.json", scale: 32000, center: [-54.8,-26.875]},
            zoomLocation: {x: -76.10387121654735, y: 184.26663952424258, k: 4},
            fertilityRate: {2006: '3.0', 2007: '3.0', 2008: '3.0', 2009: '3.0', 2010: '3.0', 2011: '3.0',2012: '3.0'}},
        {key: 'Neuquén', value: 15,
            departments: {file: "neuquen.json", scale: 16000, center: [-70.118,-38.7]},
            zoomLocation: {x: 95.8175278659974, y: 28.06552419374777, k: 4},
            fertilityRate: {2006: '2.2', 2007: '2.2', 2008: '2.2', 2009: '2.2', 2010: '2.2', 2011: '2.2',2012: '2.2'}} ,
        {key: 'Río Negro', value: 16,
            departments: {file: "rionegro.json", scale: 10500, center: [-67.5,-40.3]},
            zoomLocation: {x: 63.770288136828746, y: 2.619883357707074, k: 4},
            fertilityRate: {2006: '2.3', 2007: '2.3', 2008: '2.3', 2009: '2.3', 2010: '2.3', 2011: '2.3',2012: '2.3'}},
        {key: 'Salta', value: 17,
            departments: {file: "salta.json", scale: 15000, center: [-65.5,-24.296]},
            zoomLocation: {x: 36.96218151449586, y: 215.9362653198231, k: 4},
            fertilityRate: {2006: '2.9', 2007: '2.9', 2008: '2.9', 2009: '2.9', 2010: '2.9', 2011: '2.9',2012: '2.9'}},
        {key: 'San Juan', value: 18,
            departments: {file: "sanjuan.json", scale: 21000, center: [-68.875,-30.55]},
            zoomLocation: {x: 81.94345613572776, y: 133.52931035069435, k: 4},
            fertilityRate: {2006: '2.6', 2007: '2.6', 2008: '2.6', 2009: '2.6', 2010: '2.6', 2011: '2.6',2012: '2.6'}},
        {key: 'San Luis', value: 19,
            departments: {file: "sanluis.json", scale: 21000, center: [-66.03,-33.96]},
            zoomLocation: {x: 50.321284311148425, y: 95.19480963299873, k: 4},
            fertilityRate: {2006: '2.6', 2007: '2.6', 2008: '2.6', 2009: '2.6', 2010: '2.6', 2011: '2.6',2012: '2.6'}},
        {key: 'Santa Cruz', value: 20,
            departments: {file: "santacruz.json", scale: 10500, center: [-69.941,-49.3]},
            zoomLocation: {x: 94.00511536863121, y: -129.93778266090325, k: 4},
            fertilityRate: {2006: '2.5', 2007: '2.5', 2008: '2.5', 2009: '2.5', 2010: '2.5', 2011: '2.5', 2012: '2.5'}},
        {key: 'Santa Fe', value: 21,
            departments: {file: "santafe.json", scale: 14000, center: [-60.951,-31.2]},
            zoomLocation: {x: -6.0090172087551235, y: 135.12394188436474, k: 4},
            fertilityRate: {2006: '2.0', 2007: '2.0', 2008: '2.0', 2009: '2.0', 2010: '2.0', 2011: '2.0',2012: '2.0'}},
        {key: 'Santiago del Estero', value: 22,
            departments: {file: "santiago.json", scale: 18000, center: [-63.258,-28]},
            zoomLocation: {x: 19.553569305357566, y: 172.7488932167182, k: 4},
            fertilityRate: {2006: '2.3', 2007: '2.3', 2008: '2.3', 2009: '2.3', 2010: '2.3', 2011: '2.3', 2012: '2.3'}},
        {key: 'Tierra del Fuego', value: 23,
            departments: {file: "tierradelfuego.json", scale: 20000, center: [-66.3,-53.9]},
            zoomLocation: {x: 65.49965885548255, y:-227.61906276727228, k:4},
            fertilityRate: {2006: '2.4', 2007: '2.4', 2008: '2.4', 2009: '2.4', 2010: '2.4', 2011: '2.4', 2012: '2.4'}},
        {key: 'Tucumán', value: 24,
            departments: {file: "tucuman.json", scale: 47000, center: [-65.366,-27.05]},
            zoomLocation: {x: 42.967983972762646, y: 183.4353299256579, k: 4},
            fertilityRate: {2006: '2.3', 2007: '2.3', 2008: '2.3', 2009: '2.3', 2010: '2.3', 2011: '2.3',2012: '2.3'}}
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
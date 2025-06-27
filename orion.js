// Constants
const SteffBoltz = 5.6704e-5;


const SunMassCGS = 1.9884e33;
const SunLumCGS = 3.826e33;
const SunRadiusCGS = 6.959e10;

const EarthRadiusCGS = 6.371009e8;

const SunAbsMag = 4.83;

const SpeedOfLight = 2.99792458e10;

const LightYearCGS = 9.4607304725808e17;
const ParsecCGS = 3.0856775814914e18;

Pts.namespace(window);

var space = null;
var form = null;

function randRange(min, max) {
    return (Math.random() * (max - min)) + min
}

var tempToRGB = {}

function loadTempToRGB() {
    jQuery.get('bbr_color.txt', function(data) {
        var lineByLine = data.split('\n')

        var example = $("#example")

        lineByLine = lineByLine.slice(19)

        var lastVal = "0"; var read = false;

        lineByLine.forEach(line => {
            if (line.split('#')[1] != lastVal && read)
            {
                tempToRGB[parseInt(line.split('K')[0])] = line.split('#')[1].slice(0,-1)
                lastVal = line.split('#')[1];
            }

            read = !read;
        });

        for (const [key, value] of Object.entries(tempToRGB)) {
            example.html(example.html() + `<br>${key}: ${value}`)
        }
    });
}

function temperatureToRGB(temp) {
    
}

$(() => {
    loadTempToRGB();
    // Inputs
    starMassInput = $("#starMass");
    starMassInput.on("change", updateInfo)
    starDistInput = $("#starDistance");
    starDistInput.on("change", updateInfo)
    starAppMagInput = $("#starAppMagnitude");
    starAppMagInput.on("change", updateInfo)
    starBVMagInput = $("#starBVMagnitude");
    starBVMagInput.on("change", updateInfo)
    starTypeInput = $("#starType");
    starTypeInput.on("change", updateInfo)

    // Outputs
    starRadiusOutput = $("#starRadius");
    starLumOutput = $("#starLum");
    starAbsMagOutput = $("#starAbsMag");
    starFluxOutput = $("#starFlux");
    starSurfTempOutput = $("#starSurfTemp");
    starMassChangeRateOutput = $("#starMassChangeRate");

    // Preset
    starPreset = $("#starPreset");
    starPreset.on("change", setPreset);

    updateInfo()

    // Drawing cute sky thingy setup!

    space = new CanvasSpace("#starCanvas");
    form = space.getForm();
    space.setup({ bgcolor: "#010210" });

    // Add stars
    space.add({
        start: (bound, space) => {
            var spacW = space.size[0]; var spacH = space.size[1];
            for(i = 0; i < 100; i++) {
                var circ = Circle.fromCenter(new Pt(randRange(0,spacW), randRange(0,spacH)), 1);
                form.fillOnly("#fff").circle(circ);
            }
        }
    });
});

/**
 * Automatically updates input fields based on arguments
 * @param {double} inMass - Mass in solar masses
 * @param {double} inDist - Distance in light years
 * @param {double} inVisualMag - Visual magnitude
 * @param {double} inBVMag - B-V Index
 * @param {string} inType - Star Type (MS, WD, NS)
 */
function setInputs(inMass, inDist, inVisualMag, inBVMag, inType) {
    starMassInput.val(inMass);
    starDistInput.val(inDist);
    starAppMagInput.val(inVisualMag);
    starBVMagInput.val(inBVMag);
    starTypeInput.val(inType);

    updateInfo();
}

function setPreset() {
    switch(starPreset.val()) {
        case "Sun":
            setInputs(1, 1.58125e-5, -26.74, 0.656, "MS");
            break;

        case "ProcyonA":
            setInputs(1.478, 11.46, 0.34, 0.42, "MS");
            break;

        case "SiriusA":
            setInputs(2.063, 8.60, -1.46, 0.00, "MS");
            break;

        case "SiriusB":
            setInputs(1.018, 8.709, 8.44, -0.03, "WD");
            break;

        case "PSRJ09520607":
            setInputs(2.35, 5675, 23.2, 0, "NS");
            break;

        case "Vega":
        default:
            setInputs(2.15, 25.04, 0.03, 0.00, "MS");
            break;
    }
}


function updateInfo() {
    console.log("test!");

    // Inputs

    var starDistLy = parseFloat(starDistInput.val());
    var starDistCGS = starDistLy * LightYearCGS;
    var starDistPc = starDistCGS / ParsecCGS; 

    var starAppMag = parseFloat(starAppMagInput.val());
    var starBVMag = parseFloat(starBVMagInput.val());

    var starMassSolar = parseFloat(starMassInput.val());
    var starMassCGS = starMassSolar * SunMassCGS;

    var starType = starTypeInput.val();

    // Actual calculations!

    var starSurfTempCGS = 4600 * (1 / (0.92 * starBVMag + 1.7) + 1 / (0.92 * starBVMag + 0.62))
    // Ballestros' Formula

    var starFluxAtSurfCGS = Math.pow(starSurfTempCGS,4) * SteffBoltz;
    var starFluxAtEarthCGS = starFluxAtSurfCGS / (starDistCGS * starDistCGS)
    
    var starAbsMag = starAppMag + 5 - 5 * Math.log10(starDistPc);

    var starLumSolar = Math.pow(10, (SunAbsMag - starAbsMag)/2.5);
    var starLumCGS = starLumSolar * SunLumCGS;


    var starMassChangeRateCGS = 4 * starLumCGS / (SpeedOfLight * SpeedOfLight);
    var starMassChangeRateSolar = starMassChangeRateCGS / SunMassCGS;

    var starRadiusCGS = Math.sqrt(starLumCGS / ( 4 * Math.PI * SteffBoltz * Math.pow(starSurfTempCGS,4) ))

    if (starType == "WD") {
        starRadiusCGS = 7.8e8 * Math.pow(Math.pow(((1.4*SunMassCGS)/starMassCGS), 0.66666) - Math.pow((starMassCGS/(1.4*SunMassCGS)), 0.66666), 0.5)
    } else if (starType == "NS") {
        starRadiusCGS = 13.6e5 / Math.pow(starMassSolar, 0.33333)
    }
    var starRadiusSolar = starRadiusCGS / SunRadiusCGS;

    // Outputs

    starRadiusOutput.text(`${starRadiusSolar} R☉ || ${starRadiusCGS} cm`);
    starLumOutput.text(`${starLumSolar} L☉ || ${starLumCGS} erg/s`);
    starAbsMagOutput.text(`${starAbsMag}`);
    starFluxOutput.text(`On Surface: ${starFluxAtSurfCGS} erg/cm^2 s || On Earth: ${starFluxAtEarthCGS} erg/cm^2 s`);
    starSurfTempOutput.text(`${starSurfTempCGS} K${starType == "MS" ? "" : " <- This number is meaningless in the current context, since it depends on how long ago the star formed."}`);
    starMassChangeRateOutput.text(`${starMassChangeRateCGS} g/s || ${starMassChangeRateSolar} M☉/s`);
}
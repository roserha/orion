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

var tempToRGB = {0: "000000", 773: "000000"}

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
    });
}

function lerpRGBs(rgb_a, rgb_b, t) {
    var r_a = parseInt(rgb_a.slice(0,2), 16); var r_b = parseInt(rgb_b.slice(0,2), 16);
    var g_a = parseInt(rgb_a.slice(2,4), 16); var g_b = parseInt(rgb_b.slice(2,4), 16);
    var b_a = parseInt(rgb_a.slice(4,6), 16); var b_b = parseInt(rgb_b.slice(4,6), 16);

    var r_ret = Math.round(t*(r_b - r_a) + r_a).toString(16)
    var g_ret = Math.round(t*(g_b - g_a) + g_a).toString(16)
    var b_ret = Math.round(t*(b_b - b_a) + b_a).toString(16)
    
    if (r_ret.length == 1)
        r_ret = `0${r_ret}`
    if (g_ret.length == 1)
        g_ret = `0${g_ret}`
    if (b_ret.length == 1)
        b_ret = `0${b_ret}`

    return `${r_ret}${g_ret}${b_ret}`
}

function temperatureToRGB(temp) {
    var temps = Object.keys(tempToRGB);
    var rgbs = Object.values(tempToRGB);
    
    // "Binary" search to find smaller and bigger temps
    var smallestIndex = 0; var largestIndex = temps.length - 1;

    // Extreme case of larger temp
    if (temp < temps[smallestIndex])
        return rgbs[smallestIndex]
    if (temp > temps[largestIndex])
        return rgbs[largestIndex]

    // Find in-between temps
    while (largestIndex - smallestIndex > 1) {
        var middleIndex = Math.round((smallestIndex + largestIndex) / 2)

        if (temp <= temps[middleIndex])
            largestIndex = middleIndex
        if (temp >= temps[middleIndex])
            smallestIndex = middleIndex
    }

    // If it's a temp with an already defined rgb, return that temp
    if (smallestIndex == largestIndex)
        return rgbs[smallestIndex]

    // If not, let's lerp it up!
    var smallestTemp = temps[smallestIndex]; var largestTemp = temps[largestIndex];
    return lerpRGBs(rgbs[smallestIndex], rgbs[largestIndex], (temp - smallestTemp) / (largestTemp - smallestTemp))
}

function tempAndMagnToRGB(temp, mag) {
    var magnitude = Math.max(0, Math.min(mag, 5.83613))
    return lerpRGBs('000000', temperatureToRGB(temp), 1.2*Math.pow(100, -0.066666 * magnitude) - 0.2);
}

function drawSpace(sunOutline, starInfo) {
    // Clear
    space.clear();

    console.log(starInfo)

    // Add stars
    space.add({
        start: (bound, space) => {
            var spacW = space.size[0]; var spacH = space.size[1];
            for(i = 0; i < 256; i++) {
                var circ = Circle.fromCenter(new Pt(randRange(0,spacW), randRange(0,spacH)), randRange(0.5,1.5));
                form.fillOnly(`#${tempAndMagnToRGB(randRange(1000, 36000), randRange(0,6))}`).circle(circ);
            }

            if (sunOutline) {
                var sunRef = Circle.fromCenter(space.center, 64)
                form.strokeOnly("#600").circle(sunRef);
                form.fillOnly("#900").text([space.center[0] - 58, space.center[1] + 64 + 16], "(Sun for reference)")
            }

            var star = Circle.fromCenter(space.center, starInfo[0])
            form.fillOnly(starInfo[1]).circle(star);
        }
    });

    if (space._isReady) {
            var spacW = space.size[0]; var spacH = space.size[1];
            if ($("#starRenderStars").prop('checked')) {            
                for(i = 0; i < 256; i++) {
                    var circ = Circle.fromCenter(new Pt(randRange(0,spacW), randRange(0,spacH)), randRange(0.5,1.5));
                    form.fillOnly(`#${tempAndMagnToRGB(randRange(1000, 36000), randRange(0,6))}`).circle(circ);
                }
            }

            
            var sFlux = Math.min(starInfo[2], 1357795*4);
            
            for (var sFluxInternal = Math.ceil(sFlux / 65536); sFluxInternal > 1; sFluxInternal--) {
                if (sFlux >= 1) {
                    form.ctx.shadowBlur = Math.min(sFlux, 65536);
                    form.ctx.shadowColor = `rgb(255 255 255 / ${Math.min(sFlux, 65536)/2.56}%)`
                }
                
                sFlux -= 65536;
                
                var star = Circle.fromCenter(space.center, starInfo[0])
                form.fillOnly(starInfo[1]).circle(star);
            }
            
            form.ctx.shadowColor = `rgb(255 255 255 / 0%)`
            var star = Circle.fromCenter(space.center, starInfo[0])
            form.fillOnly(starInfo[1]).circle(star);
            
            if (sunOutline) {
                var sunRef = Circle.fromCenter(space.center, 64)
                form.strokeOnly("#600").circle(sunRef);
                form.fillOnly("#900").text([space.center[0] - 58, space.center[1] + 64 + 16], "(Sun for reference)")
            }
    }
}

$(() => {
    // Drawing cute sky thingy setup!
    space = new CanvasSpace("#starCanvas");
    form = space.getForm();
    space.setup({ bgcolor: "#010210", retina: true, pixelDensity: 4 });

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
    starAngularSizeOutput = $("#starAngularSize");

    // Preset
    starPreset = $("#starPreset");
    starPreset.on("change", setPreset);

    // Render info
    starRenderOutlineInput = $("#starRenderOutline");
    starRenderOutlineInput.on("change", updateInfo)
    starRenderStarsInput = $("#starRenderStars");
    starRenderStarsInput.on("change", updateInfo)
    
    updateInfo()
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

    updateInfo(true);
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


function updateInfo(preset = false) {

    // Inputs

    var starDistLy = parseFloat(starDistInput.val());
    var starDistCGS = starDistLy * LightYearCGS;
    var starDistPc = starDistCGS / ParsecCGS; 

    var starAppMag = parseFloat(starAppMagInput.val());
    var starBVMag = parseFloat(starBVMagInput.val());

    var starMassSolar = parseFloat(starMassInput.val());
    var starMassCGS = starMassSolar * SunMassCGS;

    var starType = starTypeInput.val();

    if (preset != true)
    {
        starPreset.val("");
    }

    // Actual calculations!

    var starSurfTempCGS = 4600 * (1 / (0.92 * starBVMag + 1.7) + 1 / (0.92 * starBVMag + 0.62))
    // Ballestros' Formula

    var starFluxAtSurfCGS = Math.pow(starSurfTempCGS,4) * SteffBoltz;
    
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
    
    var starFluxAtEarthCGS = (starRadiusCGS * starRadiusCGS) * starFluxAtSurfCGS / (starDistCGS * starDistCGS)

    var starAngRad = 2 * starRadiusCGS / starDistCGS;
    var starAngArcsec = starAngRad / (2 * Math.PI) * 360 * 3600;

    // Outputs

    starRadiusOutput.text(`${starRadiusSolar} R☉ || ${starRadiusCGS} cm`);
    starLumOutput.text(`${starLumSolar} L☉ || ${starLumCGS} erg/s`);
    starAbsMagOutput.text(`${starAbsMag}`);
    starFluxOutput.text(`On Surface: ${starFluxAtSurfCGS} erg/cm^2 s || On Earth: ${starFluxAtEarthCGS} erg/cm^2 s`);
    starSurfTempOutput.text(`${starSurfTempCGS} K${starType == "MS" ? "" : " <- This number is meaningless in the current context, since it depends on how long ago the star formed."}`);
    starMassChangeRateOutput.text(`${starMassChangeRateCGS} g/s || ${starMassChangeRateSolar} M☉/s`);
    starAngularSizeOutput.text(`${starAngRad} rad || ${starAngArcsec}''`)

    // Drawing star!
    console.log(`${starSurfTempCGS} <> ${starAppMag}`)
    drawSpace($("#starRenderOutline").prop('checked'), [Math.max(1 + 64 * starAngArcsec / 1936.25, 1), `#${tempAndMagnToRGB(starSurfTempCGS, starAppMag)}`, starFluxAtEarthCGS]);
}
// Constants
const SteffBoltz = 5.6704e-5;

const SunMassCGS = 2e33;
const SunLumCGS = 4e33;
const SunRadiusCGS = 7e10;

const SunAbsMag = 4.83;

const SpeedOfLight = 2.99792458E10;

const LightYearCGS = 9.461e17;
const ParsecCGS = 3.086e18;

$(() => {
    // Inputs
    starMassInput = $("#starMass");
    starMassInput.on("change", updateInfo)
    starDistInput = $("#starDistance");
    starDistInput.on("change", updateInfo)
    starAppMagInput = $("#starAppMagnitude");
    starAppMagInput.on("change", updateInfo)
    starBVMagInput = $("#starBVMagnitude");
    starBVMagInput.on("change", updateInfo)

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
});

/**
 * Automatically updates input fields based on arguments
 * @param {double} inMass - Mass in solar masses
 * @param {double} inDist - Distance in light years
 * @param {double} inVisualMag - Visual magnitude
 * @param {double} inBVMag - B-V Index
 */
function setInputs(inMass, inDist, inVisualMag, inBVMag) {
    starMassInput.val(inMass);
    starDistInput.val(inDist);
    starAppMagInput.val(inVisualMag);
    starBVMagInput.val(inBVMag);

    updateInfo();
}

function setPreset() {
    switch(starPreset.val()) {
        case "Sun":
            setInputs(1, 1.58125e-5, -26.74, 0.656);
            break;

        case "ProcyonA":
            setInputs(1.478, 11.46, 0.34, 0.42);
            break;

        case "Vega":
        default:
            setInputs(2.15, 25.04, 0.03, 0.00);
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

    // Actual calculations!

    var starSurfTempCGS = 4600 * (1 / (0.92 * starBVMag + 1.7) + 1 / (0.92 * starBVMag + 0.62))

    var starFluxAtSurfCGS = Math.pow(starSurfTempCGS,4) * SteffBoltz;
    var starFluxAtEarthCGS = starFluxAtSurfCGS / (starDistCGS * starDistCGS)
    
    var starAbsMag = starAppMag + 5 - 5 * Math.log10(starDistPc);

    var starLumSolar = Math.pow(10, (SunAbsMag - starAbsMag)/2.5);
    var starLumCGS = starLumSolar * SunLumCGS;


    var starMassChangeRateCGS = 4 * starLumCGS / (SpeedOfLight * SpeedOfLight);
    var starMassChangeRateSolar = starMassChangeRateCGS / SunMassCGS;

    var starRadiusCGS = Math.sqrt(starLumCGS / ( 4 * Math.PI * SteffBoltz * Math.pow(starSurfTempCGS,4) ))
    var starRadiusSolar = starRadiusCGS / SunRadiusCGS;

    // Outputs

    starRadiusOutput.text(`${starRadiusSolar} R☉ || ${starRadiusCGS} cm`);
    starLumOutput.text(`${starLumSolar} L☉ || ${starLumCGS} erg/s`);
    starAbsMagOutput.text(`${starAbsMag}`);
    starFluxOutput.text(`On Surface: ${starFluxAtSurfCGS} erg/cm^2 s || On Earth: ${starFluxAtEarthCGS} erg/cm^2 s`);
    starSurfTempOutput.text(`${starSurfTempCGS} K`);
    starMassChangeRateOutput.text(`${starMassChangeRateCGS} g/s || ${starMassChangeRateSolar} M☉/s`);
}
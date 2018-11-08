// A3 Vertex Processing Code
// Parts for students complete are maked by TODO; the rest is pre-processing

// http-server -a localhost -p 80 --cors

// Load regl module into fullsize element on the page
const regl = createREGL();

// Four data elements loaded from web server: two shader programs, geometry, and materials
// vertexSource/fragmentSource: glsl strings for the shaders
let vertexSource = undefined;
let fragmentSource = undefined;
// geometry: An associative array with three keys:
//      - vertexdata:   An Array of floating point vertex data. It is an 
//                      interleaved float array of 3 position coordinates, 
//                      3 normal coordinates, and 2 texture coordinates. 
//                      Only the positions are strictly needed for Assignment 3
//      - indexdata:    An array of unsigned integers for the index/element 
//                      buffer. Specifies how the triangles are connected.
//      - groups:       A dictionary mapping Strings to Arrays. The strings
//                      are the names of the parts, the arrays are indices
//                      into geometry.indexdata that defines that part.
let geometry = undefined;
// materials:   An Associative Array with String:Associative Array pairs. The 
//              keys are the name of the parts from geometry.groups, the 
//              associative array defines material properties for lighting and
//              texture mapping. For A3, only the "color" key should be used 
//              (the textures are not provided in this assignment).
let materials = undefined;

const INT8_SIZE = Int8Array.BYTES_PER_ELEMENT;
const INT16_SIZE = Int16Array.BYTES_PER_ELEMENT;
const FLOAT32_SIZE = Float32Array.BYTES_PER_ELEMENT;

let i = true;

let theta = -45.0;
let useOrtho = false;
let isSheared = false;
let modelMatrix = mat4.create();
let positionOffset = vec3.fromValues(0, 0, -6);
// TODO shearMatrix
let shearMatrix = mat4.create();
let viewMatrix = mat4.create();

let shearFactor = 0;

function toRadians(angle) {
    return angle * (Math.PI / 180);
}
function rotateX(matrix, angle) {
    let rad = toRadians(angle);
    // return mat4.fromXRotation(matrix, rad);
    let rotateMat = mat4.fromValues(
        1, 0, 0, 0,
        0, Math.cos(rad), Math.sin(rad), 0,
        0, -Math.sin(rad), Math.cos(rad), 0,
        0, 0, 0, 1);
    return mat4.multiply(matrix, matrix, rotateMat);
}
function rotateY(matrix, angle) {
    let rad = toRadians(angle);
    // return mat4.fromYRotation(matrix, rad);
    let rotateMat = mat4.fromValues(
        Math.cos(rad), 0, -Math.sin(rad), 0,
        0, 1, 0, 0,
        Math.sin(rad), 0, Math.cos(rad), 0,
        0, 0, 0, 1);
    return mat4.multiply(matrix, matrix, rotateMat);
}
function rotateZ(matrix, angle) {
    let rad = toRadians(angle);
    // return mat4.fromZRotation(matrix, rad);
    let rotateMat = mat4.fromValues(
        Math.cos(rad), Math.sin(rad), 0, 0,
        -Math.sin(rad), Math.cos(rad), 0, 0,
        0, 0, 1, 0,
        0, 0, 0, 1);
    return mat4.multiply(matrix, matrix, rotateMat);
}
function translate(matrix, vect) {
    //return mat4.translate(matrix, matrix, vect);
    let transMat = mat4.fromValues(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        vect[0], vect[1], vect[2], 1);
    return mat4.multiply(matrix, matrix, transMat);
}
function scale(matrix, scaleFactor) {
    //return mat4.scale(matrix, matrix, vect);
    let scaleMat = mat4.fromValues(
        scaleFactor, 0, 0, 0,
        0, scaleFactor, 0, 0,
        0, 0, scaleFactor, 0,
        0, 0, 0, 1);
    return mat4.multiply(matrix, matrix, scaleMat);
}
function shear(matrix, shearFactor) {
    let shearMat = mat4.fromValues(
        1, 0, 0, 0,
        0, 1, 0, 0,
        shearFactor, 0, 1, 0,
        0, 0, 0, 1);
    return mat4.multiply(matrix, matrix, shearMat);
}

// Set up key events and make four Fetch calls for the resources, processing accordingly. 
// Each one calls the init() function; this function only completes when
// all resources are loaded
function load() {
    // Add key listener for keyboard events
    document.addEventListener('keydown', (event) => {
        const keycode = event.key;
        if (keycode == 'ArrowRight') {
            rotateZ(modelMatrix, -5);
        }
        else if(keycode == 'ArrowLeft') {
            rotateZ(modelMatrix, 5);
        }
        else if (keycode == 'ArrowUp') {
            mat4.translate(modelMatrix, modelMatrix, [0, -10, 0]);
        }
        else if(keycode == 'ArrowDown') {
            mat4.translate(modelMatrix, modelMatrix, [0, +10, 0]);
        }
        else if (keycode == 'p') {
            useOrtho = !useOrtho;
            // console.log(useOrtho);
        }
        else if (keycode == 's') {
            // mat4.invert(modelMatrix, modelMatrix);
            shearFactor += 0.1;
            // mat4.invert(modelMatrix, modelMatrix);
        }
        else if (keycode == 'd') {
            // mat4.invert(modelMatrix, modelMatrix);
            // shear(viewMatrix, -0.1);
            // mat4.invert(modelMatrix, modelMatrix);
            shearFactor -= 0.1;
        }
    });
    
    fetch('a3.vert.glsl')
    .then(function(response) {
        return response.text();
    })
    .then(function(txt) {
        vertexSource = txt;
        init();
    });

    fetch('a3.frag.glsl')
    .then(function(response) {
        return response.text();
    })
    .then(function(txt) {
        fragmentSource = txt;
        init();
    });

    fetch('mini_geometry.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(obj) {
        geometry = obj;
        init();
    });

    fetch('mini_material.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(obj) {
        materials = obj;
        init();
    });
}

function getAngle() {
    return theta;
}

function getProjection() {
    return useOrtho;
}

function getModelMatrix() {
    // modelMatrix = mat4.create();
    // mat4.translate(modelMatrix, modelMatrix, positionOffset);
    // // modelMatrix = translate(modelMatrix, positionOffset);
    // rotateX(modelMatrix, -45.0);
    // rotateY(modelMatrix, 0.0);
    // rotateZ(modelMatrix, -45.0);
    // mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(1/150, 1/150, 1/150));
    // // modelMatrix = scale(modelMatrix, 1/150);
    return modelMatrix;
}

function getViewMatrix() {
    return viewMatrix;
}

function getShearMatrix() {
    shearMatrix = mat4.create();
    shear(shearMatrix, shearFactor);
    return shearMatrix;
}

function getOrthoMatrix() {
    let orthoMatrix = mat4.create();
    const right = window.innerWidth / 2;
    const left = -window.innerWidth / 2;
    const top = -window.innerHeight / 2;
    const bottom = window.innerHeight / 2;

    // const right = window.innerWidth;
    // const left = 0;
    // const top = window.innerHeight;
    // const bottom = 0;
    const near = 0.1;
    const far = 100.0;
    mat4.ortho(orthoMatrix, left, right, bottom, top, near, far);
    return orthoMatrix;
}

// The intialization function. Checks for all resources before continuing
function init() {
    modelMatrix = mat4.create();
    viewMatrix = mat4.create();
    mat4.translate(modelMatrix, modelMatrix, positionOffset);

    // mat4.translate(modelMatrix, modelMatrix, positionOffset2);
    // shear(modelMatrix, 1);
    // mat4.translate(modelMatrix, modelMatrix, positionOffset);
    rotateX(modelMatrix, -45.0);
    rotateY(modelMatrix, 0.0);
    rotateZ(modelMatrix, theta);
    
    // mat4.scale(modelMatrix, modelMatrix, vec3.fromValues(1/150, 1/150, 1/150));
    modelMatrix = scale(modelMatrix, 1/150);
    
    // view
    // console.log(modelMatrix);
    // console.log(viewMatrix);


    // Is everything loaded?
    if(vertexSource === undefined 
        || fragmentSource === undefined 
        || geometry === undefined
        || materials === undefined)
        return;

    // TODO: Create your regl draw function(s). Then create a regl.frame 
    // function for the animation callback that calls your draw
    // function(s). 

    drawMini = regl({
        // TODO
        // fragment shader
        frag: fragmentSource,
        
        // vertex shader
        vert: vertexSource,
        
        // attributes
        attributes: {
            position: {
                buffer: regl.buffer(new Float32Array(geometry.vertexdata)),
                size: 3,
                stride: 8 * FLOAT32_SIZE
            }
        },
        
        // uniforms
        uniforms: {
            viewport: ({viewportWidth, viewportHeight}) => [viewportWidth, viewportHeight],
            rotation: (context, props) => props.rotation,
            uModelMatrix: (context, props) => props.modelMatrix,
            uViewMatrix: (context, props) => props.viewMatrix,
            uOrthoMatrix: (context, props) => props.orthoMatrix,
            uShearMatrix: (context, props) => props.shearMatrix,
            color: (context, props) => props.color,
            carAngle: (context, props) => props.carAngle,
            useOrtho: (context, props) => props.useOrtho
            // uModelViewMatrix: regl.prop('uModelViewMatrix'),
            // uProjectionMatrix: regl.prop('uProjectionMatrix'),
        },
        
        // elements to draw
        elements: regl.elements(new Int16Array(geometry.indexdata)),
        offset: function(context, props) {return props.offset},
        count: function(context, props) {return props.count}
    });
    
    regl.frame(function({tick}) {
        if(drawMini === undefined)
            return;

        for (let i = 0; i < Object.keys(geometry.groups).length; ++i) {
            let groupName = Object.keys(geometry.groups)[i];
            let min = geometry.groups[groupName][0];
            let max = geometry.groups[groupName][1];
            let color = materials[groupName]["color"];
            // multiplying count and offset by 3 because triangles take 3 points
            drawMini({
                carAngle: getAngle(),
                color: color,
                count: (max - min) * 3,
                offset: min * 3,
                modelMatrix: getModelMatrix(),
                rotation: tick,
                viewMatrix: getViewMatrix(),
                orthoMatrix: getOrthoMatrix(),
                shearMatrix: getShearMatrix(),
                useOrtho: getProjection()
            });
        }
        
        // drawMini({rotation: tick, movement: getDisplacement(), groups: geometry.groups});
      });
}

// Call load
load();

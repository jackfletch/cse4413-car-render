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

let xdisplacement = 0.0;
let ydisplacement = 0.0;
let zdisplacement = 0.0;

let theta = -45.0;
let useOrtho = true;
let modelMatrix = mat4.create();

// Set up four Fetch calls for the resources and process accordingly. 
// Each one calls the init() function; this function only completes when
// all resources are loaded
function load() {
    // Add key listener for keyboard events
    document.addEventListener('keydown', (event) => {
        const keycode = event.key;
        if (keycode == 'ArrowRight') {
            theta += 10;
            console.log(theta);
        }
        else if(keycode == 'ArrowLeft') {
            theta -= 10;
            console.log(theta);
        }
        else if (keycode == 'ArrowUp') {
            ydisplacement -= 10;
            console.log(ydisplacement);
        }
        else if(keycode == 'ArrowDown') {
            ydisplacement += 10;
            console.log(ydisplacement);
        }
        else if (keycode == 'p') {
            useOrtho = useOrtho ? false : true;
            console.log(useOrtho);
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

function getDisplacement() {
    return [xdisplacement, ydisplacement, zdisplacement];
}

function getAngle() {
    return theta;
}

function getProjection() {
    return useOrtho;
}

function getModelMatrix() {
    return modelMatrix;
}


// The intialization function. Checks for all resources before continuing
function init()
{
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
            movement: (context, props) => props.movement,
            uModelMatrix: (context, props) => modelMatrix,
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
                movement: getDisplacement(),
                rotation: tick,
                useOrtho: getProjection()
            });
        }
        
        // drawMini({rotation: tick, movement: getDisplacement(), groups: geometry.groups});
      });
}

// Call load
load();

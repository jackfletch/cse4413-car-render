// A4 MINI fragment shader

precision mediump float;

// TODO: Add varying and uniforms here

varying vec3 vFragColor;

void main() 
{
    // TODO: Compute color and write to gl_FragColor
    gl_FragColor = vec4(vFragColor, 1);
}

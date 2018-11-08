// A3 MINI vertex shader

precision mediump float;

// attributes and uniforms here
attribute vec3 position;

uniform vec3 color;
uniform ivec2 viewport;
uniform bool useOrtho;
uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uOrthoMatrix;
uniform mat4 uShearMatrix;

varying vec3 vFragColor;

const float f = 1.0 / tan(radians(45.0) / 2.0);

// unused matrix transform functions
// these were reimplemented in the javascript so that they could be debugged
mat4 rotX(float angle) {
    angle = radians(angle);
    return mat4(1, 0, 0, 0,
                0, cos(angle), sin(angle), 0,
                0, -sin(angle), cos(angle), 0,
                0, 0, 0, 1);
}

mat4 rotY(float angle) {
    angle = radians(angle);
    return mat4(cos(angle), 0, -sin(angle), 0,
                0, 1, 0, 0,
                sin(angle), 0, cos(angle), 0,
                0, 0, 0, 1);
}

mat4 rotZ(float angle) {
    angle = radians(angle);
    return mat4(cos(angle), sin(angle), 0, 0,
                -sin(angle), cos(angle), 0, 0,
                0, 0, 1, 0,
                0, 0, 0, 1);
}

mat4 trans(vec3 dir) {
    return mat4(1, 0, 0, 0,
                0, 1, 0, 0,
                0, 0, 1, 0,
                vec4(dir, 1));
}

mat4 scale(float scaleFactor) {
    return mat4(scaleFactor, 0, 0, 0,
                0, scaleFactor, 0, 0,
                0, 0, scaleFactor, 0,
                0, 0, 0, 1);
}

mat4 proj() {
    // Create the projection matrix; remember, GL matrices column order
    float aspect = float(viewport.x) / float(viewport.y);
    float far = 100.0, near = 0.1;

    float left = -float(viewport.x) / 2.0;
    float right = float(viewport.x) / 2.0;
    float bottom = -float(viewport.y) / 2.0;
    float top = float(viewport.y) / 2.0;

    // perspective
    return mat4(f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (far + near) / (near - far), -1,
            0, 0, 2.0 * far * near / (near - far), 0);
    
    // orthographic (have yet to implement properly)
    /*else
        return mat4(
            2.0 / (right - left), 0, 0, 0,
            0, 2.0 / (top - bottom), 0, 0,
            0, 0, -2.0 / (far - near), 0,
            -(left + right) / (right - left), -(bottom + top) / (top - bottom), -(near + far) / (far - far), 1.0);*/
}

void main(void) {
    // compute position for gl_Position and other varyings

    mat4 uProjectionMatrix;
    if (!useOrtho) {
        uProjectionMatrix = proj();
    }
    // unused logic for switching between projections
    if (useOrtho) {
        uProjectionMatrix = uOrthoMatrix;
    }
    
    gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * uShearMatrix * vec4(position, 1.0);
    vFragColor = color;
}

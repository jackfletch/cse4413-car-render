// A3 MINI vertex shader

precision mediump float;

// TODO: Add attributes and uniforms here
attribute vec3 position;

uniform vec3 color;
uniform ivec2 viewport;
uniform float rotation;
uniform vec3 movement;
uniform float carAngle;
uniform bool useOrtho;

// uniform mat4 uModelViewMatrix;
// uniform mat4 uProjectionMatrix;

varying vec3 vFragColor;

const vec3 positionOffset = vec3(0, 0, -5.0);
const float miniScale = 1.0/150.0;

//const vec3 miniTranslate = vec3(0, float(movement), 0);

const float f = 1.0 / tan(radians(45.0) / 2.0);

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
    //float width = float(viewport.x);
    //float height = float(viewport.y);
    float far = 100.0, near = 0.1;

    float left = -float(viewport.x) / 2.0;
    float right = float(viewport.x) / 2.0;
    float bottom = -float(viewport.y) / 2.0;
    float top = float(viewport.y) / 2.0;

    if(!useOrtho)
        return mat4(f / aspect, 0, 0, 0,
                0, f, 0, 0,
                0, 0, (far + near) / (near - far), -1,
                0, 0, 2.0 * far * near / (near - far), 0);
    else
    /*return mat4(2.0 / width, 0, 0, 0,
                    0, 2.0 / height, 0, 0,
                    0, 0, 2.0 / (far - near), 0,
                    0, 0, -1.0 * (far + near) / (far - near), 1.0);*/
    /*return mat4(2.0 / width, 0, 0, 0,
                0, -2.0 / height, 0, 0,
                0, 0, 2.0 / (far - near), 0,
                -1, 1, 0, 1);*/
    return mat4(2.0 / (right - left), 0, 0, 0,
      0, 2.0 / (top - bottom), 0, 0,
      0, 0, 2.0 / (near - far), 0,
 
      (left + right) / (left - right),
      (bottom + top) / (bottom - top),
      (near + far) / (near - far),
      1.0);
}

void main(void) {
    // TODO: Compute position for gl_Position and other varyings

    mat4 rotateX = rotX(-45.0);
    mat4 rotateY = rotY(0.0);
    //mat4 rotateZ = rotZ(-45.0);
    mat4 rotateZ = rotZ(carAngle);
    
    mat4 uProjectionMatrix = proj();
    mat4 uModelViewMatrix = trans(positionOffset) * rotateX *  rotateY * rotateZ * scale(miniScale);

    //position = vec4(position + miniTranslate, 1.0);

    gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(position + movement, 1.0);
    vFragColor = color;
}

Assignment 1 – CS360
2D scene rendering using basic shapes and adding simple animation

Due date: Aug 31, 2025, 11:59pm
Grade: 100 points (10% of the course grade)

In this assignment, you will reproduce and render a 2D animated scene as shown below using
only three basic shapes: square, triangle, and circle. You will apply affine transformations to
translate, rotate, and scale the shapes as needed to form various objects in your scene. You will
use the glMatrix-0.9.5.min.js JavaScript matrix-vector library to perform transformations using
the APIs provided by it. Example usage of this library is discussed in class, and sample codes are
provided as references. You are not required to understand everything provided in this library.
Other than the glMatrix-0.9.5.min.js library, no other additional library is allowed to use to
complete your assignment.

Here is the scene that you will create (for all animations effects, see the attached video):

Pointers for your assignment that you should follow:

1. First create initCircleBuffer() and drawCircle() methods to add circle drawing capability.

The Square and Triangle drawing code is already provided. 2. The vertex and fragment shader codes will remain the same as provided in the example

codes. We will do shader programming in upcoming assignments. 3. You are only allowed to use squares, circles, and triangles to form the entire scene. 4. You must create the same objects as shown in the scene and try to reproduce them.

Minor size and shape changes in your scene are fine. Overall, the scene should look the
same.

5. The animations of the windmill blades, the boat, and the moon should be the same as
   shown in the accompanying video. The windmill blades and the sun rotate along its own
   center, and the boats have a back-and-forth motion on the river. See the video for
   reference.

6. The order of all the objects should be followed as shown here. For example, the
   windmill is in front of the boat. So, you must draw objects accordingly to maintain the
   order as shown in the scene.

7. Your code also should add three buttons to toggle among  
   a. gl.POINTS to show only point rendering
   b. gl.LINE_LOOP to show the wireframe mode
   c. gl.TRIANGLES to show the solid surface mode

See the video for reference.

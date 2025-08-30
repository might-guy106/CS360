PHASE 1: Foundation Setup\*\*

### Step 1: Project Structure

- Copy the hierarchical transformation code as your starting template
- Create three files: main.js, index.html, and include glMatrix-0.9.5.min.js
- Test that the basic WebGL context and shaders work

### Step 2: Implement Circle Primitive

- Create `initCircleBuffer()` function using triangle fan approach (12-16 segments for smooth circles)
- Create `drawCircle()` function matching the pattern of drawSquare
- Test circles render correctly in all three modes

### Step 3: Rendering Mode Toggle System

- Add three buttons to HTML: Points, Wireframe, Solid
- Create global variable to track current rendering mode
- Modify all draw functions to use current mode instead of hardcoded gl.TRIANGLES
- Test mode switching works with basic shapes

## **PHASE 2: Build Complex Objects (Bottom-Up Approach)**

### Step 4: Create Object Drawing Functions

Build these in order of complexity:

**Simple Objects:**

- `drawMountain(position, size, color)` - single triangle
- `drawCloud(position, size)` - overlapped circles forming oval
- `drawStar(position, twinkle)` - single point with variable opacity

**Medium Complexity:**

- `drawTree(position, size)` - rectangle trunk + stacked triangles for leaves
- `drawHouse(position)` - trapezoid roof + rectangle body + windows + door
- `drawCar(position)` - trapezoid body + semicircle top + 2 circular wheels

**Complex Objects:**

- `drawBoat(position)` - trapezoid hull + rectangle mast + triangle flag
- `drawWindmill(position, bladeRotation)` - rectangle pole + circle disc + 4 rotating triangular blades

### Step 5: Scene Layout Functions

- `drawSky()` - background rectangle + clouds + stars + moon
- `drawMountainsAndTrees()` - background layer with mountains and trees
- `drawRiver()` - horizontal rectangle for water
- `drawFrontLand()` - foreground rectangle for land

## **PHASE 3: Scene Assembly and Positioning**

### Step 6: Coordinate System Planning

- Define scene regions:
  - Sky: Y = 0.6 to 1.0
  - Mountains/River: Y = 0.2 to 0.6
  - Front Land: Y = -1.0 to 0.2
  - X range: -1.0 to 1.0

### Step 7: Static Scene Assembly

- In `drawScene()`, call scene functions in back-to-front order:
  1. drawSky()
  2. drawMountainsAndTrees()
  3. drawRiver()
  4. drawFrontLand() with house, car, windmill
- Test complete static scene renders correctly
- Adjust positions and sizes for proper composition

## **PHASE 4: Animation System**

### Step 8: Animation Infrastructure

- Add global animation variables:
  - `moonRotation`, `windmillRotation` (continuous rotation)
  - `boat1Position`, `boat2Position`, `boat1Velocity`, `boat2Velocity` (bouncing)
  - `starTwinklePhases[]` (array for star twinkling)
- Create animation loop using requestAnimationFrame (copy from hierarchical example)

### Step 9: Implement Animations (In Order)

**Moon Rotation:**

- Increment moonRotation each frame
- Use translate-rotate-translate pattern for rotation around own center

**Boat Bouncing:**

- Update boat positions based on velocity each frame
- Check for collision with river edges, reverse velocity when hit
- Both boats move independently with different speeds

**Windmill Blade Rotation:**

- Use hierarchical transforms: position windmill → rotate blade assembly → draw 4 blades
- Each blade positioned at 90° intervals around disc center

**Star Twinkling:**

- Vary star opacity using sine waves with different phases
- Create subtle sparkle effect

## **PHASE 5: Polish and Testing**

### Step 10: Fine-tuning

- Adjust colors to match reference scene
- Fine-tune object positions and sizes
- Ensure proper layering (windmill in front of boats, etc.)
- Smooth animation timing and speeds

### Step 11: Comprehensive Testing

- Test all three rendering modes with complete animated scene
- Verify animations work correctly
- Check scene matches reference image layout
- Test in both Chrome and Firefox

### Step 12: Code Cleanup

- Add proper comments and function documentation
- Ensure code follows divide-and-conquer approach with modular functions
- Remove any debug code or unused variables
- Verify submission requirements are met

## **Key Implementation Notes**

**Matrix Stack Usage:**

- Use `pushMatrix()` before applying object-specific transforms
- Use `popMatrix()` to restore previous state
- Essential for hierarchical animations (windmill blades, boat components)

**Color Scheme:**

- Define color constants for consistency
- Sky blue, grass green, water blue, mountain gray, etc.

**Animation Timing:**

- Use time-based animation for smooth motion regardless of framerate
- Consider the provided timestamp in requestAnimationFrame callback

**Trapezoid Creation:**

- Build using two triangles or modify square vertices
- Needed for house roofs, car bodies, boat hulls

This plan follows the divide-and-conquer strategy mentioned in the assignment, building complexity incrementally while ensuring each component works before moving to the next level.

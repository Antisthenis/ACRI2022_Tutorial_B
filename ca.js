"use strict";

/*
 * CELLULAR AUTOMATAS IN TWO DIMENSIONS
 * (c) 2018, University of Geneva
 */

/* SETS UP the cells.
 * Arguments:
 * - nX: Width in cells
 * - nY: Height of cells
 * - init: function from a pair <x,y> to the initial state
 */
function setup(nX,nY,init) {
    let c0 = allocate(nX+4,nY+4);
    let c1 = allocate(nX+4,nY+4);
    let x = 2;
    while( x < nX+2) {
        let y = 2;
        while( y < nY+2 ) {
            c0[x][y] = init(x,y);
            c1[x][y] = init(x,y);
            y += 1;
        }
        x += 1;
    }
    return {
        current: c0,
        next: c1,
        nX: nX+4,
        nY: nY+4
    };
}

/* STARTS the cellular automata
 * Arguments:
 * - context: html canvas
 * - cells: a datastructure returned by the setup function
 * - rule: a function mapping the tripple <x,y,c> to a new state
 *     where: 
 * - color: a function transforming the state in CSS color
 * - iter: total number of iterations
 * - delay: delay in milliseconds between each update
 */
function start( context,cells,rule,color,iter,delay) {
    animate(context,cells,rule,color,iter,delay,0);
}


/* CONVERTS an RGB triple in CSS color
 * Arguments:
 * - r,g,b: value between 0 and 1.
 */
function rgb( r, g, b ) {
    let f = (x) => Math.ceil( x * 255 );
    return "rgb(" + f(r) + "," + f(g) + "," + f(b) + ")";
}


/*****************************************************************************
 * Here comes the internal machinery. You are invited to read, but you 
 * won't need to call them directly
 */


/* Allocates the cells */
function allocate(nX,nY) {
    let cells = new Array(nX);
    let x = 0;
    while( x < nX ) {
        cells[x] = new Array(nY); 
        x+=1;
    }
    return cells;
}


/* Periodic update of cell by copying the state in halo cells */
function periodic( cells ) {
    let x = 0;
    while( x < cells.nX ) {
        cells.current[x][0] = cells.current[x][cells.nY-4];
		cells.current[x][1] = cells.current[x][cells.nY-3];
        cells.current[x][cells.nY-1] = cells.current[x][1];
        cells.current[x][cells.nY-2] = cells.current[x][0];
        x += 1;
    }
    let y = 0;
    while( y < cells.nY ) {
        cells.current[0][y] = cells.current[cells.nX-4][y];
		cells.current[1][y] = cells.current[cells.nX-3][y];
        cells.current[cells.nX-1][y] = cells.current[1][y];
        cells.current[cells.nX-2][y] = cells.current[0][y];
        y += 1;
    }
    cells.current[0][0] = cells.current[cells.nX-4][cells.nY-4];

    cells.current[0][1] = cells.current[cells.nX-4][cells.nY-3];
    cells.current[1][0] = cells.current[cells.nX-3][cells.nY-4];
    cells.current[1][1] = cells.current[cells.nX-3][cells.nY-3];
	
    cells.current[0][cells.nY-1] = cells.current[cells.nX-4][1];
	cells.current[1][cells.nY-1] = cells.current[cells.nX-3][1];
	cells.current[0][cells.nY-2] = cells.current[cells.nX-4][0];
	cells.current[1][cells.nY-2] = cells.current[cells.nX-3][0];
				
    cells.current[cells.nX-1][0] = cells.current[1][cells.nY-4];
	cells.current[cells.nX-2][0] = cells.current[0][cells.nY-4];
	cells.current[cells.nX-1][1] = cells.current[1][cells.nY-3];
	cells.current[cells.nX-2][1] = cells.current[0][cells.nY-3];
	
    cells.current[cells.nX-1][cells.nY-1] = cells.current[1][1];
	cells.current[cells.nX-2][cells.nY-1] = cells.current[0][1];
	cells.current[cells.nX-1][cells.nY-2] = cells.current[1][0];
	cells.current[cells.nX-2][cells.nY-2] = cells.current[0][0];
}

/* Use the rule to update the cells after periodic update */
function update( cells, rule ) {
    periodic( cells );
    let x=2;
    while( x < cells.nX-2 ) {
        let y = 2;
        while( y < cells.nY-2 ) {
            cells.next[x][y] = rule( x, y, cells.current );
            y += 1;
        }   
        x+=1;
    }
    let tmp = cells.next;
    cells.next = cells.current;
    cells.current = tmp;
}


/* Draw the state in the canvas, using the color function */
function drawCells(context,cells,color) {
    context.clearRect ( 0, 0, context.width, context.height );
    context.save();
    let x = 2;
    while( x < cells.nX-2) {
        let y = 2;
        while( y < cells.nY-2) {
            let col = color(cells.current[x][y]);
            context.fillStyle = col;
            context.fillRect( x-2, y-2, 2, 2);
            y += 1;
        }
        x += 1;
    }
    context.restore();
}


/* Recursive animation function */
function animate( context,cells,rule,color,iter,delay,t) {
    console.log("Iteration:", t);
    drawCells( context, cells, color );
    if( t < iter ) {
        update(cells,rule);
        setTimeout( animate, delay, context, cells, rule, color, iter, delay, t+1 );
    }
}


import { SquareClient, SquareEnvironment } from 'square'
import {
  PUBLIC_SQUARE_LOCATION_ID,
  PUBLIC_SQUARE_APP_ID,
} from '$env/static/public'
import { SQUARE_ACCESS_TOKEN } from '$env/static/private'

if (
  !PUBLIC_SQUARE_APP_ID ||
  !PUBLIC_SQUARE_LOCATION_ID ||
  !SQUARE_ACCESS_TOKEN
) {
  throw new Error('Missing Square environment variables')
}

// Simple singleton pattern
function createSquareClient() {
  return new SquareClient({
    environment: SquareEnvironment.Sandbox,
    token: SQUARE_ACCESS_TOKEN,
  })
}

// Create singleton instancehow
let squareInstance

// Check if db already exists before creating a new connection
function getSquareClient() {
  if (!squareInstance) {
    squareInstance = createSquareClient()
  }
  return squareInstance
}

export const square = getSquareClient()

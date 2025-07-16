import { SquareClient, SquareEnvironment } from 'square'
import {
  PUBLIC_SQUARE_LOCATION_ID,
  PUBLIC_SQUARE_APP_ID,
} from '$env/static/public'
import { SQUARE_ACCESS_TOKEN } from '$env/static/private'
import { v4 as uuid } from 'uuid'

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

function sortPlanVars(data) {
  return data
    .sort((a, b) => {
      const numA = parseInt(
        a.subscriptionPlanVariationData.name.match(/\d+/)[0],
      )
      const numB = parseInt(
        b.subscriptionPlanVariationData.name.match(/\d+/)[0],
      )
      return numA - numB
    })
    .map((item) => item.id)
}

export async function upsertTermPlan(
  termName: string,
  duration: number,
  prices: number[],
) {
  const idempotencyKey = uuid()
  const upsertRequest = {
    idempotencyKey,
    object: {
      type: 'SUBSCRIPTION_PLAN',
      id: '#plan',
      subscriptionPlanData: {
        name: termName,
        subscriptionPlanVariations: prices.map((amount, i) => ({
          type: 'SUBSCRIPTION_PLAN_VARIATION',
          id: `#var_${i}`,
          subscriptionPlanVariationData: {
            name: `${i + 1} Student(s)`,
            phases: [
              {
                ordinal: BigInt(0),
                cadence: 'MONTHLY',
                periods: duration,
                pricing: {
                  type: 'STATIC',
                  priceMoney: { amount: BigInt(amount), currency: 'USD' },
                },
              },
            ],
          },
        })),
      },
    },
  }

  const response = await square.catalog.object.upsert(upsertRequest)
  const fin = sortPlanVars(
    response.catalogObject.subscriptionPlanData.subscriptionPlanVariations,
  )
  console.debug(response.catalogObject.id)
  console.debug(fin)
  return [response.catalogObject.id, fin]
}

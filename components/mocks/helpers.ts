export function getRandomEnumValue<T>(enumeration: any): T {
  const values = Object.values(enumeration) as T[]
  const randomIndex = Math.floor(Math.random() * values.length)
  return (values as any)[randomIndex] as T
}

export function getRandomInt(min: number, max: number) {
  // Ensure that min is less than or equal to max
  if (min > max) {
    throw new Error('Min must be less than or equal to max')
  }

  // Generate a random number between min (inclusive) and max (exclusive)

  const randomInt = min + Math.floor(Math.random() * max);
  return randomInt;
}

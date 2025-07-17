
export async function fetchRestaurantData(): Promise<Response> {
  try {
    const response = await fetch('https://almuerzoclbackend.pages.dev/restaurants.json', { cache: 'no-store' });
    return response;
  } catch (error) {
    // This catch block handles network errors (e.g., server unreachable, DNS issues)
    // and re-throws them to be caught by the UI component.
    console.error("Network error in fetchRestaurantData:", error);
    if (error instanceof Error) {
        throw new Error(`Network request failed: ${error.message}`);
    }
    throw new Error('An unknown network error occurred.');
  }
}
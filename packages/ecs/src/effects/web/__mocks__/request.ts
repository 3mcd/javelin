export const request = jest.fn(() => ({
  response: {
    json: () =>
      Promise.resolve({
        x: 0,
      }),
  },
  done: true,
  error: null,
}))

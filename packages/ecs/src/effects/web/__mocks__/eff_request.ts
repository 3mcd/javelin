export const effRequest = jest.fn(() => ({
  response: {
    json: () =>
      Promise.resolve({
        x: 0,
      }),
  },
  done: true,
  error: null,
}))

export const stripe = {
    charges:{
        create: jest
            .fn()
            .mockResolvedValue({}) //will return a promise with an empty object that automatically resolves itself
    }
}
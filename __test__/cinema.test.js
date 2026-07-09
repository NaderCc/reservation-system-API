const cinemaService = require('../services/cinema.service');
const cinemaRepository = require('../repo/cinema.repo');
const redisClient = require('../config/redis');

jest.mock('../repo/cinema.repo');
jest.mock('../config/redis');

describe('Cinema Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should update only name and location and clear cinema cache', async() => {
        const existingCinema = {
            id: 1,
            name: 'Old Cinema',
            location: 'Old Location',
            image_url: 'https://example.com/old.jpg'
        };
        const updatedCinema = {
            id: 1,
            name: 'New Cinema',
            location: 'New Location',
            image_url: 'https://example.com/new.jpg'
        };

        cinemaRepository.findById.mockResolvedValue(existingCinema);
        cinemaRepository.update.mockResolvedValue(updatedCinema);
        redisClient.safeDelPattern.mockResolvedValue(1);

        const result = await cinemaService.updateCinema(1, {
            name: 'New Cinema',
            location: 'New Location',
            image_url: 'https://example.com/ignored.jpg'
        });

        expect(cinemaRepository.findById).toHaveBeenCalledWith(1);
        expect(cinemaRepository.update).toHaveBeenCalledWith(1, {
            name: 'New Cinema',
            location: 'New Location'
        });
        expect(redisClient.safeDelPattern).toHaveBeenCalledWith('cinemas:*', expect.any(Number));
        expect(result).toEqual(updatedCinema);
    });

    test('should throw an error when no supported fields are provided', async() => {
        await expect(cinemaService.updateCinema(1, { image_url: 'https://example.com/ignored.jpg' })).rejects.toMatchObject({
            statusCode: 400,
            message: 'No supported cinema fields provided for update'
        });
    });
});
import asyncHandler from 'express-async-handler';

const config = {
    minimumWage: 610,
    deMinimisLimit: 10000,
    regularHolidays: ['01/01/2025', '12/25/2025'],
    specialNonWorkingDays: ['02/08/2025']
};

export const getConfig = asyncHandler(async (req, res) => {
    res.status(200).json(config);
});
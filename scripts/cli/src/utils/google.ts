import { config } from 'dotenv';
import type { sheets_v4 } from 'googleapis';
import { GoogleApis } from 'googleapis';

config();

function readEnv() {
    const CLIENT_EMAIL = process.env.CLIENT_EMAIL || process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
    const SPREAD_SHEET_ID = process.env.SPREAD_SHEET_ID || '';
    const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

    return { CLIENT_EMAIL, SPREAD_SHEET_ID, PRIVATE_KEY };
}

const google = new GoogleApis();

function getAuthToken() {
    const { CLIENT_EMAIL, PRIVATE_KEY } = readEnv();

    return new google.auth.JWT({
        email: CLIENT_EMAIL,
        key: PRIVATE_KEY,
        scopes: [
            'https://www.googleapis.com/auth/spreadsheets',
            'https://www.googleapis.com/auth/calendar.readonly',
        ],
    });

    // return auth.();
}

export type Spreadsheet = Awaited<ReturnType<typeof createSheets>>;

export async function createSheets() {
    const { SPREAD_SHEET_ID } = readEnv();
    const token = getAuthToken();

    const googleSheet = google.sheets({
        version: 'v4',
        auth: token,
    });

    return {
        getValues: async (ranges: string[]) => {
            const context = await googleSheet.spreadsheets.values.batchGet({
                spreadsheetId: SPREAD_SHEET_ID,
                ranges,
            });

            return context.data.valueRanges || [];
        },

        setValues: async (range: string, values: sheets_v4.Schema$ValueRange['values']) => {
            await googleSheet.spreadsheets.values.update({
                spreadsheetId: SPREAD_SHEET_ID,
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: {
                    values,
                },
            });
        },

        getSheets: async (): Promise<sheets_v4.Schema$Sheet[]> => {
            const { data } = await googleSheet.spreadsheets.get({
                spreadsheetId: SPREAD_SHEET_ID,
            });

            return data.sheets || [];
        },

        addSheet: async (title: string) => {
            await googleSheet.spreadsheets.batchUpdate({
                spreadsheetId: SPREAD_SHEET_ID,
                requestBody: {
                    requests: [
                        {
                            addSheet: {
                                properties: {
                                    title,
                                },
                            },
                        },
                    ],
                },
            });
        },
    };
}

// This interface is used to communicate card informations
// from the server to the client and vice versa

import { Card } from './card';

export interface CardIO {
    firstImage: string;
    secondImage: string;
    metadata: Card;
}

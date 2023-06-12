export interface GameEvent {
    this: Object; // Object upon which the method is going to be called (this)
    method: Function;
    params?: any[]; // Utilisation de any acceptée par Kamel le 3 avril 2023 puisque le type des paramètres varie d'une méthode à l'autre
    timestamp: number;
}

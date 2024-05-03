export type UserIdAndUsername = { id: number; username: string };

export type PlayerSpot = {
    name: string,
    player: UserIdAndUsername | null,
    strategic_data?: any
}
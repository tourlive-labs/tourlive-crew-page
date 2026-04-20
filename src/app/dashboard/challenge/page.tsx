import { getActiveChallengeConfig } from "@/app/actions/challenge-config";
import ChallengeContent from "./ChallengeContent";

export default async function ChallengePage() {
    const config = await getActiveChallengeConfig();
    return <ChallengeContent config={config} />;
}

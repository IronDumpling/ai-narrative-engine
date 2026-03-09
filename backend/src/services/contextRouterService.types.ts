export interface BridgerPayload {
  task: string;
  character_context: unknown;
  world_context: unknown[];
  start_event: string;
  end_event: string;
  existing_content?: string;
}

export interface ValidatorPayload {
  task: string;
  character_traits: string[];
  world_rules: string[];
  text_to_verify: string;
}

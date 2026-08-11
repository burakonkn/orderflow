import { createRepository } from "./fileRepository.js";

export const customerRepository = createRepository("./data/customers.json");

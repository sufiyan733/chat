import { get } from "mongoose";
import "dotenv/config"
const getEnv = (key: string, defaultValue?: string): string => {
  
    
  const value = process.env[key] || defaultValue;

  if (value === undefined) {
    throw Error(`Missing String environment variable for ${key}`);
  }

  return value;
};


export const PORT = getEnv("PORT","5000");
export const REDIS_URL= getEnv("REDIS_URL")
export const DB_URL=getEnv("DB_URL")
export const Rabbitmq_Host=getEnv("Rabbitmq_Host")

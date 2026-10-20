export const API_BASE_URL = 'https://rest-papers.onrender.com';

// Small fetch wrapper: sends/receives JSON and turns HTTP errors into thrown Errors
export async function request(path, options = {}) {
 const response = await fetch(API_BASE_URL + path, {
   ...options,
   headers: { 'Content-Type': 'application/json', ...options.headers },
   body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
 });

 const text = await response.text();
 let data = text;
 try {
   data = text ? JSON.parse(text) : null;
 } catch {
   // not JSON, keep the plain text (the API returns plain-text error messages)
 }

 if (!response.ok) {
   const message = (data && (data.message || data.error)) || text || response.statusText;
   throw new Error(message);
 }
 return data;
}

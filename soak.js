import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export let errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // ramp up to 400 users
    { duration: '3h56m', target: 200 }, // stay at 400 for ~4 hours
    { duration: '2m', target: 0 }, // scale down. (optional)
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests must complete below 1.5s
    "errors": ["rate < 0.1"], //<10% errors
  },
};

export default function () {
  const res = http.get('https://brodo-newtheme-production.mystagingwebsite.com/');
  check(res, { 'status was 200': (r) => r.status == 200 })|| errorRate.add(1);;
  sleep(1);
}

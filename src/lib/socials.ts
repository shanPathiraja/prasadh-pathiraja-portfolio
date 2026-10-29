/**
 * Contact details, deliberately in a module of their own.
 *
 * These used to be exported from Nav, which is a 'use client' module. A server
 * component importing a plain value from a client module gets undefined — Next
 * swaps the module for a client-reference stub — so every consumer outside Nav
 * silently lost it: the About row rendered blank, the mailto links read
 * "mailto:undefined", and the GitHub and LinkedIn anchors came out with no href
 * at all, since React drops an undefined attribute without complaining.
 *
 * Nothing here may import from a client component.
 */
export const SOCIALS = {
  github: 'https://github.com/shanPathiraja',
  linkedin: 'https://www.linkedin.com/in/prasadh-pathiraja-a64b7aba/',
  email: 'prasadh.pathiraja@gmail.com',
};

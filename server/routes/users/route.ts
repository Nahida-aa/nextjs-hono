import { createRouter } from "~/lib/create-app";
import get_route from './get'
// import post_route from './post'
import create_route from './create'
import patch_route from './patch'
import delete_route from './delete'

const router = createRouter()

router.route('', get_route)
// router.route('', post_route)
router.route('', create_route)
router.route('', patch_route)
router.route('', delete_route)

export default router